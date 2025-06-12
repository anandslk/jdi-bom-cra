import { useAppDispatch, useAppSelector } from "src/app/jdiBom/store";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { useQuery } from "@tanstack/react-query";
import { env } from "src/app/jdiBom/env";
import {
  removeSingleObject,
  updateObjectDetail,
  updateObjectId,
} from "../slices/reducers/jdiBom.reducer";

export const useJdiBom = () => {
  const dispatch = useAppDispatch();

  const { objectIds, objectDetails, isDropped } = useAppSelector(
    (state) => state.jdiBom,
  );

  const existingObjectIds = useAppSelector((state) =>
    state.jdiBom.objectIds.map((obj) => obj.objectId),
  );

  const { fetchWithAuth, headers } = useFetchWithAuth();

  const collabSpace = useQuery({
    queryKey: ["collabSpace", isDropped],

    queryFn: async () => {
      const url = `${env.ENOVIA_URL}/resources/modeler/pno/person?current=true&select=collabspaces`;
      const response = (await fetchWithAuth({
        customUrl: url,
      })) as UserCollabspaces;

      return response;
    },

    enabled: !!headers?.data && isDropped,
  });

  // Fetch collaborative space ID
  const collabSpaceId = useQuery({
    queryKey: ["collabSpaceId", isDropped, collabSpace?.data],

    queryFn: async () => {
      const settles = await Promise.allSettled(
        (collabSpace?.data?.collabspaces ?? []).map(async (collabSpace) => {
          const searchStr = encodeURIComponent(collabSpace.name);
          const url = `/modeler/dslib/dslib:Library/search?$searchStr=${searchStr}`;
          const response = (await fetchWithAuth({ url })) as any;
          const found = response.member.find(
            (item: any) => item.title === collabSpace.name,
          );

          return found?.id ?? null;
        }),
      );

      // Map down to our result shape, logging or capturing errors
      return settles.map((res, idx) => {
        if (res.status === "fulfilled") {
          return { id: res.value };
        } else {
          console.error(
            `Error fetching ID for "${collabSpace?.data?.collabspaces[idx].name}":`,
            res.reason,
          );
          return { id: null, error: res.reason as Error };
        }
      });
    },

    enabled: !!collabSpace?.data && !!headers?.data && isDropped,
  });

  // Fetch library data
  const plants = useQuery({
    queryKey: ["plants", collabSpaceId?.data, isDropped],

    queryFn: async () => {
      // Handle array of collab space IDs
      const validIds = (collabSpaceId?.data || [])
        .map((c) => c?.id)
        .filter(Boolean);

      // Fetch all libraries in parallel
      const responses = await Promise.allSettled(
        validIds.map((id) =>
          fetchWithAuth({
            url: `/modeler/dslib/dslib:Library/${id}?$mask=dslib:ExpandClassifiableClassesMask`,
          }),
        ),
      );

      // Return array of successful responses
      return responses.map((res) =>
        res.status === "fulfilled" ? res.value : null,
      );
    },

    select: (data: any[]) => {
      // const collaborativeSpaces = (objectDetails || [])
      //   .map((d) => d?.["Collaborative Space"])
      //   .filter(Boolean);
      // const uniqueSpaces = [...new Set(collaborativeSpaces)];

      const results = data
        .flatMap((libraryResponse) => {
          if (!libraryResponse) return [];

          const library = libraryResponse?.member?.[0];

          const result = library?.ChildClasses?.member?.flatMap(
            (classItem: any) =>
              classItem?.ChildClasses?.member?.map(
                (child: any) => child?.title,
              ) ?? [],
          );

          // const library = libraryResponse?.member?.find((l: any) =>
          //   uniqueSpaces.includes(l?.collabspace)
          // );

          // // 1) Filter ChildClasses by collabspace
          // const level1Classes =
          //   library?.ChildClasses?.member?.filter((c: any) =>
          //     uniqueSpaces.includes(c.collabspace)
          //   ) ?? [];

          // // 2) Extract grandchild titles

          // const result = level1Classes.flatMap(
          //   (classItem: any) =>
          //     classItem?.ChildClasses?.member?.map(
          //       (child: any) => child?.title
          //     ) ?? []
          // );

          return result;
        })
        .filter(Boolean);

      return results;
    },

    enabled: !!collabSpaceId?.data && isDropped,
  });

  const fetchPrevRev = async (objectDetails: IProductInfo[]) => {
    console.log("objectIds,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,", objectIds);
    const inWorkIds = objectIds?.filter(({ objectId }) => {
      const detail = objectDetails?.find(
        (obj) => obj["Dropped Revision ID"] === objectId,
      );

      return ["In Work", "Frozen"].includes(detail?.["Maturity State"]!);
    });

    if (inWorkIds.length === 0) return [];

    const products = inWorkIds?.map(({ objectId, objectType }) => {
      const detail = objectDetails?.find(
        (obj) => obj?.["Dropped Revision ID"] === objectId,
      );

      const baseURL = new URL(detail?.imageURL!);
      const source = `${baseURL?.protocol}//${baseURL?.hostname}/enovia`;

      return {
        id: objectId,
        identifier: objectId,
        type: objectType,
        source,
        relativePath: detail?.relativePath,
      };
    });

    if (products.length === 0) return [];

    const response = (await fetchWithAuth({
      url: "/modeler/dslc/version/getGraph",
      method: "POST",
      body: { data: products },
    })) as EngItemResponse;

    return (response?.results as EngItemResult[]) || [];
  };

  const prevRev = useQuery({
    queryKey: ["prevRev", objectIds, isDropped],
    queryFn: () => fetchPrevRev(objectDetails),
    enabled: !!headers?.data && isDropped && !!objectDetails?.length,
  });

  const removeStateProduct = (released: EngItemVersion, itemId: string) => {
    const releasedId = released?.id;
    const alreadyExists = existingObjectIds?.includes(releasedId);

    if (!alreadyExists) {
      dispatch(
        updateObjectDetail({
          droppedRevisionId: itemId,
          updates: {
            "Dropped Revision ID": released?.id,
            "Latest Released Revision ID": released?.id,
            "Maturity State": released?.maturityState,
            relativePath: released?.relativePath,
            "Dropped Revision": released?.revision,
          },
        }),
      );

      dispatch(
        updateObjectId({
          objectId: itemId,
          updates: { objectId: released?.id },
        }),
      );
    } else {
      dispatch(removeSingleObject(releasedId));
      return Promise.resolve(null);
    }
  };

  const updateMaturityState = (droppedRevisionId: string) => {
    dispatch(
      updateObjectDetail({
        droppedRevisionId,
        updates: {
          "Maturity State": "frozen",
        },
      }),
    );
  };

  const checkEngRelease = async (
    prevRev: EngItemResult[],
    removeStateProduct: (released: EngItemVersion, itemId: string) => void,
    updateMaturityState: (id: string) => void,
  ): Promise<string[]> => {
    const responses = await Promise.allSettled(
      (prevRev ?? []).map((item) => {
        const released = item?.versions?.find(
          (v) => v?.maturityState === "RELEASED",
        );

        if (!released) return Promise.resolve(null);

        removeStateProduct(released, item?.id);

        return fetchWithAuth({
          url: `/modeler/dslib/dslib:ClassifiedItem/${released?.id}?$mask=dslib:ClassificationAttributesMask`,
        }) as Promise<ClassifiedItemResponse>;
      }),
    );

    const classifRes = responses?.map((res) =>
      res.status === "fulfilled" ? res.value : null,
    ) as ClassifiedItemResponse[];

    const unreleasedIds: string[] = [];

    classifRes?.forEach((product) => {
      const classificationMembers =
        product?.member?.[0]?.ClassificationAttributes?.member ?? [];

      const hasFalsePlantAssignment = classificationMembers?.some((classItem) =>
        classItem?.Attributes?.some(
          (attr) =>
            attr?.name === "PlantAssignmentClass" && attr?.value !== true,
        ),
      );

      if (hasFalsePlantAssignment) {
        const droppedRevisionId = product?.member?.[0]?.id;

        if (droppedRevisionId) {
          updateMaturityState(droppedRevisionId);
          unreleasedIds.push(droppedRevisionId);
        }
      }
    });

    return unreleasedIds;
  };

  const engRelease = useQuery({
    queryKey: ["engRelease", prevRev?.data],

    queryFn: () =>
      checkEngRelease(prevRev?.data!, removeStateProduct, updateMaturityState),

    enabled: !!headers?.data && isDropped && !!prevRev?.data,
  });

  // console.log("prevRev................", engRelease?.data);

  // // Fetch classified item data
  // const associatedPlants = useQuery({
  //   queryKey: [
  //     "classifiedItem",
  //     objectIds?.[0].objectId,
  //     plants?.data,
  //     isDropped,
  //   ],
  //   queryFn: async () => {
  //     const url = `/modeler/dslib/dslib:ClassifiedItem/${objectIds?.[0].objectId}?$mask=dslib:ClassificationAttributesMask`;
  //     return await fetchWithAuth({ url });
  //   },

  //   select: (data: any) => {
  //     const lib = data?.member?.find(
  //       (l: any) => l?.name === objectDetails?.[0].Name
  //     );

  //     const allValues =
  //       lib.ClassificationAttributes?.member.flatMap((cls: any) =>
  //         cls.Attributes.map((attr: any) => attr.value)
  //       ) ?? [];

  //     const matchedValues = allValues.filter((v: any) =>
  //       plants?.data?.includes(v)
  //     );

  //     // 6. (Optional) Deduplicate if you only want unique entries
  //     const uniqueMatches = Array.from(new Set(matchedValues));

  //     return uniqueMatches as string[];
  //   },

  //   enabled: !!objectIds?.[0].objectId && !!plants?.data && isDropped,
  // });

  // useQuery({
  //   queryKey: ["getMfgItem", objectIds?.objectId, isDropped],
  //   queryFn: async () => {
  //     const url = `/modeler/dsmfg/invoke/dsmfg:getMfgItemsFromEngItem`;

  //     const res = (await fetchWithAuth(url, "POST", [
  //       objectIds?.objectId,
  //     ])) as IMfg;

  //     const results: IEnrichedMember[] = await Promise.all(
  //       res.member.map(async (m) => {
  //         const refactoredPath = m?.relativePath?.replace("/resources/v1", "");

  //         const detail = (await fetchWithAuth(
  //           refactoredPath,
  //           "GET"
  //         )) as IDetail["detail"];

  //         return { ...m, detail };
  //       })
  //     );

  //     const hasUnreleased = results?.some((m) =>
  //       m?.detail?.member?.some((item) => item?.state !== "RELEASED")
  //     );

  //     if (hasUnreleased) {
  //       toast.error("Plant engineering items are not in released state");
  //       dispatch(removeProduct());
  //     }

  //     return results;
  //   },

  //   enabled: !!headers?.data && !!objectIds?.objectId && isDropped,
  // });

  return {
    plants,
    prevRev,
    collabSpace,
    collabSpaceId,
    engRelease,
    fetchPrevRev,
    checkEngRelease,
  };
};

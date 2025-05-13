import { useAppSelector } from "src/app/jdiBom/store";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { useQuery } from "@tanstack/react-query";
import { env } from "src/app/jdiBom/env";

export const useJdiBom = () => {
  const { objectDetails, isDropped } = useAppSelector((state) => state.jdiBom);

  const { fetchWithAuth, headers } = useFetchWithAuth();

  const collabSpace = useQuery<Datas>({
    queryKey: ["collabSpace", objectDetails, isDropped],
    queryFn: async () => {
      const url = `${env.ENOVIA_BASE_URL}/resources/modeler/pno/person?current=true&select=collabspaces`;
      const response = (await fetchWithAuth({ customUrl: url })) as any;
      return response;
    },

    enabled: !!headers?.data && isDropped,
  });

  // Fetch collaborative space ID
  const collabSpaceId = useQuery({
    queryKey: ["collabSpaceId", objectDetails, isDropped, collabSpace?.data],
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

  // // Fetch classified item data
  // const associatedPlants = useQuery({
  //   queryKey: ["classifiedItem", objectIds?.objectId, plants?.data, isDropped],
  //   queryFn: async () => {
  //     const url = `/modeler/dslib/dslib:ClassifiedItem/${objectIds?.objectId}?$mask=dslib:ClassificationAttributesMask`;
  //     return await fetchWithAuth(url);
  //   },

  //   select: (data: any) => {
  //     const lib = data?.member?.find(
  //       (l: any) => l?.name === objectDetails?.Name
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

  //   enabled: !!objectIds?.objectId && !!plants?.data && isDropped,
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

  return { plants };
};

interface Role {
  pid: string;
  name: string;
  nls: string;
}

interface Organization {
  pid: string;
  name: string;
  title: string;
}

interface Couple {
  organization: Organization;
  role: Role;
}

interface Collabspace {
  pid: string;
  name: string;
  title: string;
  couples: Couple[];
}

interface Datas {
  pid: string;
  name: string;
  collabspaces: Collabspace[];
}

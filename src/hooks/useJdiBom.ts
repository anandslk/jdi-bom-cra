import { useAppDispatch, useAppSelector } from "src/store";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { useQuery } from "@tanstack/react-query";
import { IDetail, IEnrichedMember, IMfg } from "src/pages/jdiBom/types";
import { removeProduct } from "src/store/droppedObjectSlice";
import { toast } from "react-toastify";

export const useJdiBom = () => {
  const { objectDetails, objectIds, isDropped } = useAppSelector(
    (state) => state.droppedObject
  );

  const dispatch = useAppDispatch();
  const { fetchWithAuth, headers } = useFetchWithAuth();

  // Fetch collaborative space ID
  const collabSpaceId = useQuery({
    queryKey: ["collabSpace", objectDetails, objectDetails?.Title, isDropped],
    queryFn: async () => {
      const url = `/modeler/dslib/dslib:Library/search?$searchStr=${objectDetails?.["Collaborative Space"]}`;
      const response = (await fetchWithAuth(url)) as any;
      return response.member.find(
        (item: any) => item?.title === objectDetails?.["Collaborative Space"]
      )?.id;
    },

    enabled:
      !!objectDetails?.["Collaborative Space"] && !!headers?.data && isDropped,
  });

  // Fetch library data
  const plants = useQuery({
    queryKey: ["plants", collabSpaceId?.data, isDropped],
    queryFn: async () => {
      const url = `/modeler/dslib/dslib:Library/${collabSpaceId?.data}?$mask=dslib:ExpandClassifiableClassesMask`;
      return await fetchWithAuth(url);
    },
    select: (data: any) => {
      const lib = data?.member?.find(
        (l: any) => l?.collabspace === objectDetails?.["Collaborative Space"]
      );

      // 2) Within that library, filter its ChildClasses by collabspace
      const level1 = lib?.ChildClasses?.member.filter(
        (c: any) => c?.collabspace === objectDetails?.["Collaborative Space"]
      );

      // 3) For each of those, take each grand‑child’s title, split on space, grab item [1]
      const result = level1?.flatMap((c: any) =>
        c?.ChildClasses?.member?.map(
          (child: any) => child?.title?.split(" ")?.[1]
        )
      );

      return result;
    },

    enabled: !!collabSpaceId?.data && isDropped,
  });

  // Fetch classified item data
  const associatedPlants = useQuery({
    queryKey: ["classifiedItem", objectIds?.objectId, plants?.data, isDropped],
    queryFn: async () => {
      const url = `/modeler/dslib/dslib:ClassifiedItem/${objectIds?.objectId}?$mask=dslib:ClassificationAttributesMask`;
      return await fetchWithAuth(url);
    },

    select: (data: any) => {
      const lib = data?.member?.find(
        (l: any) => l?.name === objectDetails?.Name
      );

      const allValues =
        lib.ClassificationAttributes?.member.flatMap((cls: any) =>
          cls.Attributes.map((attr: any) => attr.value)
        ) ?? [];

      const matchedValues = allValues.filter((v: any) =>
        plants?.data?.includes(v)
      );

      // 6. (Optional) Deduplicate if you only want unique entries
      const uniqueMatches = Array.from(new Set(matchedValues));

      return uniqueMatches as string[];
    },

    enabled: !!objectIds?.objectId && !!plants?.data && isDropped,
  });

  useQuery({
    queryKey: ["getMfgItem", objectIds?.objectId, isDropped],
    queryFn: async () => {
      const url = `/modeler/dsmfg/invoke/dsmfg:getMfgItemsFromEngItem`;

      const res = (await fetchWithAuth(url, "POST", [
        objectIds?.objectId,
      ])) as IMfg;

      const results: IEnrichedMember[] = await Promise.all(
        res.member.map(async (m) => {
          const refactoredPath = m?.relativePath?.replace("/resources/v1", "");

          const detail = (await fetchWithAuth(
            refactoredPath,
            "GET"
          )) as IDetail["detail"];

          return { ...m, detail };
        })
      );

      const hasUnreleased = results?.some((m) =>
        m?.detail?.member?.some((item) => item?.state !== "RELEASED")
      );

      if (hasUnreleased) {
        toast.error("Plant engineering items are not in released state");
        dispatch(removeProduct());
      }

      return results;
    },

    enabled: !!headers?.data && !!objectIds?.objectId && isDropped,
  });

  return {
    associatedPlants,
  };
};

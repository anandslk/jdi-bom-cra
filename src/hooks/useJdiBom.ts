import { useAppSelector } from "src/store";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { useQuery } from "@tanstack/react-query";

export const useJdiBom = () => {
  const { objectDetails, objectIds } = useAppSelector(
    (state) => state.droppedObject
  );

  const { fetchWithAuth, headers } = useFetchWithAuth();

  // Fetch collaborative space ID
  const collabSpaceId = useQuery({
    queryKey: ["collabSpace", objectDetails, objectDetails?.Title],
    queryFn: async () => {
      const url = `/modeler/dslib/dslib:Library/search?$searchStr=${objectDetails?.["Collaborative Space"]}`;
      const response = (await fetchWithAuth(url)) as any;
      return response.member.find(
        (item: any) => item?.title === objectDetails?.["Collaborative Space"]
      )?.id;
    },
    enabled: !!objectDetails?.["Collaborative Space"] && !!headers?.data,
  });

  // Fetch library data
  const libraryData = useQuery({
    queryKey: ["libraryData", collabSpaceId?.data],
    queryFn: async () => {
      const url = `/modeler/dslib/dslib:Library/${collabSpaceId?.data}?$mask=dslib:ExpandClassifiableClassesMask`;
      return await fetchWithAuth(url);
    },
    enabled: !!collabSpaceId?.data,
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
  });

  // Fetch classified item data
  const classifiedItem = useQuery({
    queryKey: ["classifiedItem", objectIds?.objectId, libraryData?.data],
    queryFn: async () => {
      const url = `/modeler/dslib/dslib:ClassifiedItem/${objectIds?.objectId}?$mask=dslib:ClassificationAttributesMask`;
      return await fetchWithAuth(url);
    },
    enabled: !!objectIds?.objectId && !!libraryData?.data,

    select: (data: any) => {
      const lib = data?.member?.find(
        (l: any) => l?.name === objectDetails?.Name
      );

      const allValues =
        lib.ClassificationAttributes?.member.flatMap((cls: any) =>
          cls.Attributes.map((attr: any) => attr.value)
        ) ?? [];

      const matchedValues = allValues.filter((v: any) =>
        libraryData?.data?.includes(v)
      );

      // 6. (Optional) Deduplicate if you only want unique entries
      const uniqueMatches = Array.from(new Set(matchedValues));

      return uniqueMatches as string[];
    },
  });

  return {
    collabSpaceId,
    libraryData,
    classifiedItem,
  };
};

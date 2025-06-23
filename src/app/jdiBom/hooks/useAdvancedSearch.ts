import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ClipboardEvent, useState } from "react";
import {
  ISelectedItem,
  MutationData,
  SearchResult,
} from "../components/AdvancedSearch";
import { env } from "../env";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { useHandleDrop } from "./useHandleDrop";
import { useJdiBom } from "./useJdiBom";

export const useAdvancedSearch = () => {
  const [chips, setChips] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const [items, setItems] = useState<string[]>([]);
  const [isUnreleased, setIsUnreleased] = useState(false);
  const [isObsolete, setIsObsolete] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  const { fetchWithAuth } = useFetchWithAuth();
  const { handleDrop, isFetching } = useHandleDrop();

  const extractAttribute = (result: SearchResult, attrName: string): string => {
    const attr = result.attributes.find((a) => a.name === attrName);
    if (!attr) return "";
    if (Array.isArray(attr.value)) {
      return attr.value[0]?.toString() ?? "";
    }
    return typeof attr.value === "boolean" ? String(attr?.value) : attr.value;
  };

  const processResults = (data: MutationData["results"]): ISelectedItem[] => {
    return data?.map((result) => ({
      label: extractAttribute(result, "ds6w:label"),
      objectId: extractAttribute(result, "resourceid"),
      objectType: extractAttribute(result, "ds6w:what/ds6w:type"),
      description: extractAttribute(result, "ds6w:description"),
      revision: extractAttribute(result, "ds6wg:revision"),
      status: extractAttribute(result, "ds6w:what/ds6w:status"),
      identifier: extractAttribute(result, "ds6w:identifier"),
      created: extractAttribute(result, "ds6w:when/ds6w:created"),
    }));
  };

  const { checkEngRelease } = useJdiBom();

  const fetchPrevRev = async (productDetails: IProductInfo[]) => {
    const products = productDetails?.map((item) => {
      const baseURL = new URL(item?.imageURL!);
      const source = `${baseURL?.protocol}//${baseURL?.hostname}/enovia`;

      return {
        id: item?.["Dropped Revision ID"],
        identifier: item?.["Dropped Revision ID"],
        type: item?.Type,
        source,
        relativePath: item?.relativePath,
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

  const searchParts = useMutation({
    mutationFn: async (chips: string[]) => {
      const url = env.ADVANCED_SEARCH!;

      const fullQuery = `(${chips?.join(" OR ")}) AND flattenedtaxonomies:"types/VPMReference" OR flattenedtaxonomies:"types/Raw_Material" OR flattenedtaxonomies:"types/Document"`;

      const body = {
        specific_source_parameter: {
          drive: {
            additional_query:
              ' AND NOT ([flattenedtaxonomies]:"types/DriveNode" AND ( [current]:"Trashed" OR [policy]:"Drive File Iteration") )',
          },
        },
        with_indexing_date: true,
        with_synthesis: true,
        with_nls: false,
        label: `3DSearch-e1331143-InContextSearch-${dayjs().valueOf()}`,
        locale: "en",
        select_predicate: [
          "ds6w:label",
          "ds6w:type",
          "ds6w:description",
          "ds6w:identifier",
          "ds6w:modified",
          "ds6w:created",
          "ds6wg:revision",
          "ds6w:status",
          "ds6w:responsible",
          "owner",
          "ds6w:responsibleUid",
          "ds6wg:filesize",
          "ds6w:i3dx",
          "ds6w:project",
          "ds6w:dataSource",
          "ds6w:community",
          "ds6w:originator",
          "dsgeo:referential",
          "ds6w:lastModifiedBy",
          "ds6w:repository",
          "dcterms:title",
          "dcterms:description",
          "ds6w:containerUid",
        ],
        with_synthesis_hierarchical: true,
        select_file: ["icon", "thumbnail_2d"],
        query: fullQuery,
        select_exclude_synthesis: ["ds6w:what/ds6w:topic"],
        order_by: "desc",
        order_field: "relevance",
        select_snippets: [
          "ds6w:snippet",
          "ds6w:label:snippet",
          "ds6w:responsible:snippet",
          "ds6w:community:snippet",
          "swym:message_text:snippet",
        ],
        nresults: 40,
        start: "0",
        source: [
          "swym",
          "3dspace",
          "drive",
          "usersgroup",
          "3dplan",
          "dashboard",
          "sourcing",
          "3dmessaging",
        ],
        tenant: "OI000186152",
        login: {
          "3dspace": {
            SecurityContext: "VPLMProjectLeader.Company Name.ACT-Gas Motors",
          },
        },
      };

      const res = (await fetchWithAuth({
        customUrl: url,
        method: "POST",
        headers: {},
        body,
      })) as MutationData;

      const filtered = res?.results?.filter((entry) =>
        entry.attributes.some(
          (attr) =>
            attr.name === "ds6w:label" &&
            chips?.includes(attr?.value as string),
        ),
      );

      const resResult = filtered ? processResults(filtered) : [];

      if (!!!resResult?.length) {
        setItems(chips);
        setIsNotFound(true);
        return;
      }

      const notFoundChips = chips.filter(
        (chip) => !resResult.some((item) => item.label === chip),
      );

      if (!!notFoundChips.length) {
        setItems(notFoundChips);
        setIsNotFound(true);
      }

      const fetchedProducts = await handleDrop(
        resResult?.map((item) => ({
          objectId: item?.objectId,
          objectType: item?.objectType,
        })),
      );

      const prevr = await fetchPrevRev(fetchedProducts!);

      const unreleasedIds = await checkEngRelease(prevr!);

      if (unreleasedIds?.length > 0) {
        const unreleased = fetchedProducts
          .filter((product) =>
            unreleasedIds.includes(product["Dropped Revision ID"]),
          )
          ?.map((item) => item?.Title);

        setItems(unreleased);
        setIsUnreleased(true);
      }

      const releasedParts =
        fetchedProducts?.filter(
          (item) => item["Maturity State"]?.toLowerCase() === "released",
        ) ?? [];

      return releasedParts as IProductInfo[];
    },
  });

  const splitTerms = (text: string) =>
    text
      ?.split(/[,\s\n\r]+/)
      ?.map((s) => s?.trim())
      ?.filter(Boolean);

  // const addChips = (values: string[]) => {
  //   setChips((prev) => {
  //     const newOnes = values?.filter((v) => v && !prev.includes(v));
  //     return [...prev, ...newOnes];
  //   });
  // };

  const handleSearchParts = async () => {
    if (!inputValue) return null;

    const terms = splitTerms(inputValue);

    if (!!!terms.length) return null;

    setChips(terms);

    // const updateMaturityState = (id: string) => {
    //   setFormState((prev) => {
    //     const updatedParts = [...prev.parentParts];

    //     const index = updatedParts.findIndex(
    //       (item) => item["Dropped Revision ID"] === id
    //     );

    //     if (index !== -1) {
    //       updatedParts[index] = {
    //         ...updatedParts[index],
    //         "Maturity State": "frozen",
    //       };
    //     }

    //     return {
    //       ...prev,
    //       parentParts: updatedParts,
    //     };
    //   });
    // };

    // const removeStateProduct = (released: EngItemVersion, itemId: string) => {
    //   const releasedId = released?.id;
    //   const alreadyExists = existingObjectIds?.includes(releasedId);

    //   if (!alreadyExists) {
    //     setFormState((prev) => {
    //       const droppedRevisionId = itemId;

    //       const updates = {
    //         "Dropped Revision ID": released?.id,
    //         "Latest Released Revision ID": released?.id,
    //         "Maturity State": released?.maturityState,
    //         relativePath: released?.relativePath,
    //         "Dropped Revision": released?.revision,
    //       };

    //       const updatedObjectDetails = [...(prev.parentParts ?? [])];

    //       const index = updatedObjectDetails.findIndex(
    //         (item) => item["Dropped Revision ID"] === droppedRevisionId
    //       );

    //       if (index !== -1) {
    //         updatedObjectDetails[index] = {
    //           ...updatedObjectDetails[index],
    //           ...updates,
    //         };
    //       }

    //       return {
    //         ...prev,
    //         parentParts: updatedObjectDetails,
    //       };
    //     });

    //     dispatch(
    //       updateObjectId({
    //         objectId: itemId,
    //         updates: { objectId: releasedId },
    //       })
    //     );
    //   } else {
    //     setFormState((prev) => ({
    //       ...prev,
    //       parentParts: prev.parentParts.filter(
    //         (item) => item["Dropped Revision ID"] !== releasedId
    //       ),
    //     }));

    //     dispatch(removeSingleObject(releasedId));
    //     return Promise.resolve(null);
    //   }
    // };

    const products = (await searchParts.mutateAsync(terms)) as IProductInfo[];

    return products;
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const terms = splitTerms(paste);
    const newOnes = terms?.filter((v) => v && !chips.includes(v));

    if (newOnes.length > 0) {
      setChips((prev) => [...prev, ...newOnes]);
      searchParts.mutate(newOnes);

      return newOnes;
    }

    return null;
  };

  const handleDeleteChip = (chipToDelete: string) => {
    setChips((prev) => prev?.filter((c) => c !== chipToDelete));
  };

  return {
    chips,
    setChips,
    inputValue,
    setInputValue,
    handlePaste,
    splitTerms,
    handleDeleteChip,
    handleSearchParts,
    isFetching,

    isUnreleased,
    setIsUnreleased,

    items,
    setItems,

    isNotFound,
    setIsNotFound,

    isObsolete,
    setIsObsolete,
  };
};

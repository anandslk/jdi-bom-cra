import { useMutation } from "@tanstack/react-query";
import {
  ISelectedItem,
  MutationData,
  SearchResult,
} from "../components/AdvancedSearch";
import { useFetchWithAuth } from "./useFetchWithAuth";
// import { useHandleDrop } from "./useHandleDrop";
import { env } from "../env";
import { ClipboardEvent, KeyboardEvent, useState } from "react";
import { useHandleDrop } from "./useHandleDrop";

export const useAdvancedSearch = () => {
  const [chips, setChips] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const { fetchWithAuth } = useFetchWithAuth();
  const { handleDrop, isFetching } = useHandleDrop();

  const extractAttribute = (result: SearchResult, attrName: string): string => {
    const attr = result?.attributes?.find((a) => a.name === attrName);
    return attr ? (Array.isArray(attr.value) ? attr.value[0] : attr.value) : "";
  };

  const processResults = (data: MutationData): ISelectedItem[] => {
    return data?.results?.map((result) => ({
      label: extractAttribute(result, "ds6w:label"),
      objectId: extractAttribute(result, "resourceid"),
      objectType: extractAttribute(result, "ds6w:what/ds6w:type"),
      description: extractAttribute(result, "ds6w:description"),
      revision: extractAttribute(result, "ds6wg:revision"),
      status: extractAttribute(result, "ds6w:what/ds6w:status"),
      identifier: extractAttribute(result, "ds6w:identifier"),
      created: extractAttribute(result, "ds6w:when/ds6w:created"), //ds6w:who/ds6w:responsible
    }));
  };

  const mutation = useMutation({
    mutationFn: async (chips: string[]) => {
      const url = env.ADVANCED_SEARCH!;

      const partNumberQuery = chips
        ?.map((pn) => `[ds6wg:EnterpriseExtension.V_PartNumber]:"${pn}"`)
        .join(" OR ");

      const fullQuery = `flattenedtaxonomies:"types/VPMReference" AND flattenedtaxonomies:"interfaces/EnterpriseExtension" AND ( ${partNumberQuery} )`;

      const res = (await fetchWithAuth({
        customUrl: url,
        method: "POST",
        headers: {},
        body: {
          specific_source_parameter: {
            "3dspace": {
              additional_query:
                ' AND NOT (owner:"ENOVIA_CLOUD" OR owner:"Service Creator" OR owner:"Corporate" OR owner:"User Agent" OR owner:"SLMInstallerAdmin" OR owner:"Creator" OR owner:"VPLMAdminUser")',
            },
          },
          with_indexing_date: true,
          with_synthesis: true,
          with_nls: false,
          label: "3DSearch-e1331143-AdvancedSearch-1747843671676",
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
          ],
          with_synthesis_hierarchical: true,
          select_file: ["icon", "thumbnail_2d"],
          query: fullQuery, // use dynamic query here
          refine: {},
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
          source: ["3dspace"],
          tenant: "OI000186152",
          login: {
            "3dspace": {
              SecurityContext: "VPLMProjectLeader.Company Name.Common Space",
            },
          },
        },
      })) as MutationData;

      const resResult = res ? processResults(res) : [];

      const fetchedProducts = await handleDrop(
        resResult?.map((item) => ({
          objectId: item?.objectId,
          objectType: item?.objectType,
        })),
      );

      return fetchedProducts as IProductInfo[];
    },
  });

  // const results = mutation.data ? processResults(mutation.data) : [];
  // const resultCount = mutation.data?.infos.nresults || 0;

  // Existing handlers remain the same, just update the state management

  const splitTerms = (text: string) =>
    text
      ?.split(/[,\s\n\r]+/)
      ?.map((s) => s?.trim())
      ?.filter(Boolean);

  // const addChips = (values: string[]) => {
  //   setChips((prev) => {
  //     const newOnes = values?.filter((v) => v && !prev.includes(v));

  //     console.log("newOnes.................", newOnes);
  //     return [...prev, ...newOnes];
  //   });
  // };

  const handleInputChange = async () => {
    if (inputValue) {
      const terms = splitTerms(inputValue);
      // const newOnes = terms?.filter((v) => v && !chips.includes(v));

      // if (newOnes.length > 0) {
      if (terms.length > 0) {
        setChips(terms);
        // setChips((prev) => [...prev, ...newOnes]);
        // setInputValue("");

        return (await mutation.mutateAsync(terms)) as IProductInfo[];
      }

      // setInputValue("");
    }

    return null;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      handleInputChange();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const terms = splitTerms(paste);
    const newOnes = terms?.filter((v) => v && !chips.includes(v));

    if (newOnes.length > 0) {
      setChips((prev) => [...prev, ...newOnes]);
      mutation.mutate(newOnes);

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
    handleKeyDown,
    handlePaste,
    mutation,
    splitTerms,
    // results,
    handleDeleteChip,
    handleInputChange,
    isFetching,
  };
};

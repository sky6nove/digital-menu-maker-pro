
// If this file doesn't exist, we'll create it
export * from "./productComplements";
export * from "./use-mobile";
export * from "./use-toast";
export * from "./useCategories";
export * from "./useComplementGroups";
export * from "./useDataHelpers";
export * from "./useGroupComplements";
export * from "./useReorderMenu";
export * from "./useProductMenuComplements";
// Rename the direct import to avoid conflict with the one from productComplements
export { useProductComplementGroups as useProductComplementGroupsLegacy } from "./useProductComplementGroups";
export * from "./useProducts";

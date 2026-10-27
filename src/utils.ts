import { isAbsolute, relative, resolve, sep } from "path";

// Returns true when filePath resolves to a location inside directory (subfolders allowed).
export const isPathInsideDirectory = (directory: string, filePath: string): boolean => {
  const relativePath = relative(resolve(directory), resolve(filePath));
  return (
    relativePath !== "" &&
    relativePath !== ".." &&
    !relativePath.startsWith(".." + sep) &&
    !isAbsolute(relativePath)
  );
};

export const partitionArray = <T>(
  array: Array<T>,
  partitionIndex: number,
  totalPartitions: number
): Array<T> => {
  const totalElements = array.length;
  const elementsInEachPartition = Math.ceil(totalElements / totalPartitions);
  const startingIndex = (partitionIndex - 1) * elementsInEachPartition;
  return array.slice(startingIndex, startingIndex + elementsInEachPartition);
};

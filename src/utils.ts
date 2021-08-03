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

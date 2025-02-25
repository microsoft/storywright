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

export interface Story {
  id: string;
  tags: string[];
  name: string;
  kind: string;
  parameters?:  import("./StoryWright/Steps").StoryParameters;
  steps?: import('./StoryWright/Steps').Step[];
  storyFn?: () => unknown;
  [key: string]: unknown;
}

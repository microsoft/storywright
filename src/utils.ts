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
  parameters?: import("./StoryWright/Steps").StoryParameters;
  steps?: import("./StoryWright/Steps").Step[];
  /**
   * @deprecated - will be removed in next major. won't exist with `componentApi: 'parameters'`
   */
  storyFn?: () => unknown;
  [key: string]: unknown;
}

export interface StorybookFeatures {
  /**
   * @deprecated - will be removed in next major. SB v8 doesn't support this anymore
   */
  argTypeTargetsV7: boolean;
  buildStoriesJson: boolean;
  disallowImplicitActionsInRenderV8: boolean;
  legacyDecoratorFileOrder: boolean;
  storyStoreV7?: boolean;
  warnOnLegacyHierarchySeparator: boolean;
}

import { Steps } from "../../StoryWright/Steps";

describe("Steps", () => {
  test("should add steps when use snapshot method without option", () => {
    const name = "foo";
    const expectedSteps = [
      {
        type: "saveScreenshot",
        name,
        locator: {},
      },
    ];

    const s = new Steps();
    s.snapshot("foo");

    expect(s.steps).toEqual(expectedSteps);
  });

  test("should add steps when use snapshot method with option", () => {
    const name = "foo";
    const cropTo = "bar";
    const option = {
      cropTo,
    };
    const expectedSteps = [
      {
        type: "cropScreenshot",
        name,
        locator: {
          value: option.cropTo,
        },
      },
    ];

    const s = new Steps();
    s.snapshot("foo", option);

    expect(s.steps).toEqual(expectedSteps);
  });
});

# Storywright

> This repo has been populated by an initial template to help get you started. Please
> make sure to update the content to build a great experience for community-building.

Storywright is a tool to capture screenshots for React Storybook using Playwright. 

## How it works

Storywright works alongside Storybook to produce screenshots of the stories. In addition, it has capability to interact with the stories by clicking, hovering, waiting and many more actions.

Storywright exposes a React component, <StoryWright>, which can be added as a decorator in stories. For eg: 

If we have a button component, <Button />, and a story around that component, Button.stories.tsx, then:

In Button.stories.tsx:

```bash
const StoryWriteDemo = (story) => 
    <StoryWright>
        {story()}
    </StoryWright>
}

export default {
    title: "Button"
}

export const ButtonStory = () => <Button></Button>
```

Above code will take screenshot of the whole page where <Button> is rendered.

### Testing Interactions
To test interactions, you can add Steps to each state to interact with the UI. This is useful for clicking buttons, filling out forms, and getting the UI into the proper visual state to test.

Here is an same example as above with interactions:

```bash
const StoryWriteDemo = (story) => 
    <StoryWright
        steps={new Steps()
        click('.btn')
        .snapshot('snapshot1')
        .end()}
    >
        {story()}
    </StoryWright>
}

export default {
    title: "Button"
}

export const ButtonStory = () => <Button></Button>
```

Following methods are currently available:

- `click(selector: string)`
- `snapshot(filename: string)`
- `hover(selector: string)`
- `mouseUp(selector: string)`
- `mouseDown(selector: string)`
- `setValue(selector: string, value: string)`
- `keys(selector: string, keys: string)`
- `focus(selector: string)`
- `executeScript(code: string)`
- `wait(selector: string)`
- `waitForNotFound(selector: string)`
- `click(selector)`
- `waitForTimeout(millisecs: number)`





let stories = window.__STORYBOOK_CLIENT_API__?.raw() || [];
let ret= [];
for (let story of stories) {
    try {
        if (typeof story.storyFn === 'function') {
            let res = story.storyFn();
            if(res.props && res.props.isStowrWrightComponent===true)
            {
                story.steps=res.props.steps;
            }
        }
    }
    catch (ex) {
        console.error('Error processing render() method of:', story["id"]);
    }
    ret.push(story);
}
ret;
function findSteps(res) {
    if (res.props && res.props.isStowrWrightComponent === true) {
        return res.props.steps;
    }
    if (res.props && res.props.children) {
        children = res.props.children;
        if (typeof children === 'object' && typeof children.map === 'function' && children.length > 0) {
            for (var i = 0, len = children.length; i < len; i++) {
                let steps = findSteps(children[i]);
                if (steps) return steps;
            }
        }
        else {
            let steps = findSteps(children);
            return steps;
        }
    }
}

let stories = window.__STORYBOOK_CLIENT_API__?.raw() || [];
let ret = [];
for (let story of stories) {
    try {
        if (typeof story.storyFn === 'function') {
            let res = story.storyFn();
            let steps = findSteps(res);
            if (steps !== "undefined" && steps !== null) {
                story.steps = steps;
            }
        }
    }
    catch (ex) {
        console.error('Error processing render() method of:', story["id"]);
        console.error(ex);
    }
    ret.push(story);
}
ret;

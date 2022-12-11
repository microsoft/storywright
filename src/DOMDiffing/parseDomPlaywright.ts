import {Page} from "playwright";
import * as fs from "fs";
import { compress } from "compress-json";

const parseHTMLAndKeepRelations = (selector: string) => {
    let rootElement: any;
    const rootElementLoc = {
        x: 0,
        y: 0,
    };
    const dummyNodeMap = new Map();

    if(selector !== ""){
        console.log("selector exist");
        rootElement = document.querySelector(selector);
        rootElementLoc["x"] = rootElement.getBoundingClientRect().x;
        rootElementLoc["y"] = rootElement.getBoundingClientRect().y;
    } else{
        console.log("selector doesn't exist");
        rootElement = document.querySelector("html");  
    }
    
    let pageParsedDom = {}
    let totalDomElementParsed = 0;

    const  iterateDomElements = (node: any, parent: string, id: number, parentId: number, _nthChild: number) => {
        ++totalDomElementParsed;
        node["visited"] = true;
        let name: string = node["tagName"].toLowerCase();
        const domElement = {};

        domElement[name] = {
            "coordinates": {
                "x": 0,
                "y": 0,
                "height": 0,
                "width": 0
            },
            "uniqueId": "",
            "shifted": false,
            "nthChild": _nthChild,
            "cssComparisonResult": {},
            "attributes": {},
            "cssProps": {},
            "path": ((parentId == 0 ? "" : parent+">") + node.tagName.toLowerCase()).trim() + ":nth-child(" + _nthChild + ")",
            "childNodes": []
        };

        setParsedDomKeys(node, domElement, name, id, parentId);
        let nthChild = 0;
        if(node.hasChildNodes()){
            for(const childNode of node.childNodes){
                if(childNode.tagName && !(["script", "style"].includes(childNode.tagName.toLowerCase()))){
                    domElement[name]["childNodes"].push(iterateDomElements(childNode, domElement[name]["path"], id+1, id+1, ++nthChild));
                }
            }
        }
        return domElement;
    }

    const cleanAttributes = (attr: string) => {
        let uniqueStr = "";
        Object.entries(attr).forEach((entry) => {
            const [key, value] = entry;
            if(!["class"].includes(key)){
                uniqueStr += `${key}:${value}*`;
            }
        });
        return uniqueStr;
    }

    const findAppliedCSSOnElement = (node: any) =>{
        const appliedCSS = window.getComputedStyle(node);
        const style = {};
        const dummyNode = document.createElement(node.tagName);        
        node.getAttribute("type") ? dummyNode.setAttribute("type", node.getAttribute("type")) : null;
        // document.body.append(dummyNode);
        console.log(`node.tagName, dummyNode.tagName: ${dummyNode.tagName}, ${node.tagName}`);
        let dummyNodeStyle = [];

        if(!dummyNodeMap.has(node.tagName)){
            dummyNodeStyle = Object.keys(window.getComputedStyle(dummyNode));
            dummyNodeMap.set(node.tagName, dummyNodeStyle);
        } else {
            dummyNodeStyle = dummyNodeMap.get(node.tagName);
        }

        for(let i=0; i<appliedCSS.length; i++){
            var propName = appliedCSS.item(i);
            if(!dummyNodeStyle.includes(propName)){
                style[propName] = appliedCSS.getPropertyValue(propName);
            }
        }
        
        return style;
    }

    const findElementAttributes = (node: any) => {
        const attrsValue = {};

        if(node.hasAttributes()){
            const attributes = node.attributes;
            for(let i=0; i<attributes.length; i++){
                if(attributes[i].name !== "elementId"){
                    attrsValue[attributes[i].name] = attributes[i].value;
                }
            }    
        }

        return attrsValue;
    }

    const setParsedDomKeys = (node: any, domElement, name, id, parentId) => {
        const coordinates = node.getBoundingClientRect();
        domElement[name]["attributes"] = findElementAttributes(node);
        domElement[name]["cssProps"] = findAppliedCSSOnElement(node);
        // findAppliedCSSOnElement(node);
        domElement[name]["found"] = false;
        domElement[name]["elementId"] = id;
        domElement[name]["parentId"] = parentId;
        domElement[name]["uniqueId"] = name + "-" + cleanAttributes(domElement[name]["attributes"]);
        domElement[name]["coordinates"]["x"] = Math.round(coordinates["x"] - rootElementLoc["x"]);
        domElement[name]["coordinates"]["y"] = Math.round(coordinates["y"] - rootElementLoc["y"]);
        domElement[name]["coordinates"]["height"] = Math.round(coordinates["height"]);
        domElement[name]["coordinates"]["width"] = Math.round(coordinates["width"]);
    }

    pageParsedDom = iterateDomElements(rootElement, "", 0, 0, 1);
    
    return [
        pageParsedDom,
        totalDomElementParsed
    ];
    
}

export const parseWebPage = async (page: Page, filename: string, selector?: any, shouldCompress: boolean=false) => {
    console.log(`\n\n********  PARSING DOM  ********`);
    const result = await page.evaluate(parseHTMLAndKeepRelations, selector);
    console.log(`filename, selector: ${filename}, ${selector}`);

    let compressedResult = {};

    if(shouldCompress){
        compressedResult = compress(result[0]);
    }else {
        compressedResult = result[0];
    }
    
    fs.writeFileSync(filename, JSON.stringify(compressedResult), "utf-8");
    return result[0];
}
import {Page} from "playwright";
import * as fs from "fs";
import { compress } from "compress-json";

const parseHTMLAndKeepRelations = (selector: string) => {

    let pageElements: any;
    let dummy = document.createElement( 'element-' + ( Date.now() ) );
    document.body.appendChild( dummy );   
    const dummyElementStyleKeys = Object.keys(window.getComputedStyle(dummy));

    if(selector !== ""){
        console.log("selector exist");
        pageElements = document.querySelector(selector);
    } else{
        console.log("selector doesn't exist");
        pageElements = document.querySelector("html");    
    }
    
    let pageParsedDom = {}
    let totalDomElementParsed = 0;

    for(const element of pageElements){
        if(!element["visited"]){
            pageParsedDom = iterateDomElements(element, "", 0, 0, 1);    
        }
    }
    
    for(const element of pageElements){
        if(element["visited"]){
            element["visited"] = false;
            markElementNonVisited(element);
        }
    }
    
    return [
        pageParsedDom,
        totalDomElementParsed
    ];

    function markElementNonVisited(node) {
        console.log("marking element false");
        for(const childNode of node.childNodes){
            childNode["visited"] = false;
        }
    }

    function iterateDomElements(node, parent, id, parentId, _nthChild) {
        ++totalDomElementParsed;
        node["visited"] = true;
        let name = node["tagName"].toLowerCase();
        const domElement = {};

        domElement[name] ={
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
        for(const childNode of node.childNodes){
            if(childNode.tagName && !childNode["visited"]){
                if (childNode.tagName.toLowerCase() == "script"){
                    childNode["visited"] = true;
                }else{
                    domElement[name]["childNodes"].push(iterateDomElements(childNode, domElement[name]["path"], id+1, id+1, ++nthChild));
                }
            }
        }

        return domElement;
    }

    function setParsedDomKeys(node, domElement, name, id, parentId){
        const coordinates = node.getBoundingClientRect();
        domElement[name]["attributes"] = findElementAttributes(node);
        domElement[name]["cssProps"] = findAppliedCSSOnElement(node);
        domElement[name]["found"] = false;
        domElement[name]["elementId"] = id;
        domElement[name]["parentId"] = parentId;
        domElement[name]["uniqueId"] = name + "-" + cleanAttributes(domElement[name]["attributes"]);
        domElement[name]["coordinates"]["x"] = coordinates["x"];
        domElement[name]["coordinates"]["y"] = coordinates["y"];
        domElement[name]["coordinates"]["height"] = coordinates["height"];
        domElement[name]["coordinates"]["width"] = coordinates["width"];
    }

    function cleanAttributes(attr) {
        let uniqueStr = "";
        Object.entries(attr).forEach((entry) => {
            const [key, value] = entry;
            uniqueStr += `${key}:${value}*`
        });
        return uniqueStr;
    }

    function findAppliedCSSOnElement(node){   
        const appliedCSS = window.getComputedStyle(node);
        const style = {};

        for(let i=0; i<appliedCSS.length; i++){
            var propName = appliedCSS.item(i);
            if(!dummyElementStyleKeys.includes(propName)){
                style[propName] = appliedCSS.getPropertyValue(propName);
            }
        }
        
        return style;
    }

    function findElementAttributes(node){
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
    
}

export const parseWebPage = async (page: Page, filename: string, selector?: any) => {
    console.log('In paseWebPages');

    console.log(`\n\n********  PARSING DOM ********`);
    const result = await page.evaluate(parseHTMLAndKeepRelations, selector);
    console.log(`filename, selector: ${filename}, ${selector}`);
    const compressedResult = compress(result[0]);
    // compress;
    // const compressedResult = result[0];
    fs.writeFileSync(filename, JSON.stringify(compressedResult), "utf-8");
    // fs.writeFileSync(filename, JSON.stringify(compressedResult), "utf-8");
    return result[0];
}
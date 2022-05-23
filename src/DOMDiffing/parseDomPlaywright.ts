import playwright from "playwright";
import * as fs from "fs";

/**
 *  parseHTMLAndKeepRelations (Without underscore) contains the logic of parsing DOM.
 */
const parseHTMLAndKeepRelations = (cropTo: string) => {
    // console.log("test");
    const pageElements = document.querySelectorAll("*");
    let pageParsedDom = {}
    let totalDomElementParsed = 0;

    for(const element of pageElements){
        if(!element["visited"]){
            pageParsedDom = iterateDomElements(element, "", 0, 0, 1);    
        }
    }    
    // console.log(`pageParsedDom = ${JSON.stringify(pageParsedDom, null, 2)}`);
    return [
        pageParsedDom,
        totalDomElementParsed
    ];

    function iterateDomElements(node, parent, id, parentId, _nthChild) {
        // console.log(parent + " --> " + node.tagName);
        ++totalDomElementParsed;
        node["visited"] = true;
        let name = node["tagName"].toLowerCase();
        const domElement = {};

        domElement[name] ={
            "nthChild": _nthChild,
            "cssComparisonResult": {},
            "attributes": {},
            "cssProps": {},
            "path": ((parentId == 0 ? "" : parent+">") + node.tagName.toLowerCase()).trim() + ":nth-child(" + _nthChild + ")",
            "childNodes": []
        };

        setParsedDomKeys(node, domElement, name, id, parentId);
        // console.log(`domElement ${JSON.stringify(domElement)}`);
        let nthChild = 0;
        for(const childNode of node.childNodes){
            if(childNode.tagName && !childNode["visited"]){   
                // console.log(childNode.tagName);
                if (childNode.tagName.toLowerCase() == "script"){
                    childNode["visited"] = true;
                }else{
                    // console.log(node["nthChild"]);
                    domElement[name]["childNodes"].push(iterateDomElements(childNode, domElement[name]["path"], id+1, id+1, ++nthChild));
                }
            }
        }

        return domElement;
    }

    function setParsedDomKeys(node, domElement, name, id, parentId){
        domElement[name]["attributes"] = findElementAttributes(node);
        domElement[name]["cssProps"] = findAppliedCSSOnElement(node);
        domElement[name]["missing"] = true;
        domElement[name]["userId"] = id;
        domElement[name]["parentId"] = parentId;
    }

    function findAppliedCSSOnElement(node){
        const appliedCSS = window.getComputedStyle(node);
        const style = {};

        for(let i=0; i<appliedCSS.length; i++){
            var propName = appliedCSS.item(i);

            style[propName] = appliedCSS.getPropertyValue(propName);
        }
        
        return style;
    }

    function findElementAttributes(node){
        const attrsValue = {};

        if(node.hasAttributes()){
            const attributes = node.attributes;
            for(let i=0; i<attributes.length; i++){
                if(attributes[i].name !== "userId"){
                    attrsValue[attributes[i].name] = attributes[i].value;
                }
            }    
        }

        return attrsValue;
    }
    
}

export const parseWebPage = async (page: Page, filename: string) => {
    const type = filename.toLowerCase().includes("baseline") ? "BASELINE" : "CANDIDATE";

    console.log(`\n\n********  PARSING DOM ${type} ********`);
    const result = await page.evaluate(parseHTMLAndKeepRelations);
    // console.log(`element: ${JSON.stringify(result, null, 2)}`);
    console.log(`\n\nHURRAYYY !!!...COMPLETED PARSING ${type}`);
    fs.writeFileSync(filename, JSON.stringify(result[0], null, 2), "utf-8");
    return result[0];
}
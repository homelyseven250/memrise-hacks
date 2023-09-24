// ==UserScript==
// @name         Memrise Cheats
// @namespace    burgernocheese
// @version      0.0.1
// @description  try to take over the world!
// @author       You
// @match        //app.memrise.com/aprender/*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

import { invert } from "underscore"

(function () {
    'use strict';
    // console.log('Memrise Cheats loaded');
    const standardFetch = window.fetch;
    let learnableDict = {};
    let learnableDictInverted = {};

    let tappableLearnables = {};
    let tappableLearnablesDefs = {};
    window.fetch = async function (...args) {
        const resp = await standardFetch(...args);
        const resp2 = resp.clone();
        setTimeout(async () => {
            if (args[0].includes("learning_sessions/learn")) {
                const bodyJson = await resp.json();
                // console.log(bodyJson);
                for (const learnable of bodyJson.learnables) {
                    learnableDict[learnable.learning_element] = learnable.definition_element;
                }
                learnableDictInverted = invert(learnableDict);
                for (const learnable of bodyJson.learnables) {
                    tappableLearnables[learnable.definition_element] = learnable.learning_element_tokens;
                }
                for (const learnable of bodyJson.learnables) {
                    tappableLearnablesDefs[learnable.learning_element] = learnable.definition_element_tokens;
                }
                console.log(learnableDict, learnableDictInverted, tappableLearnables, tappableLearnablesDefs);
            }
        }, 0);
        return resp2
    };
    const keyboardEventEnter = new KeyboardEvent('keyup', {
        bubbles: true, cancelable: true, keyCode: 13
    });
    setInterval(async () => {
        let nextButton = document.querySelector("#__next > div.sc-35r7d9-0.cMleEG > div > div > div > div > div > div.sc-dmyDmy.hWraRz.sc-1hec6-1.eFJIoV.sc-1rrao7o-4.kDatTd > button")
        let question = document.querySelector("#__next > div.sc-35r7d9-0.cMleEG > div > div > div > div > div > div.sc-1rrao7o-2.dKbScP > div")
        // console.log(question, question?.getAttribute("data-testid"));
        if (question?.getAttribute("data-testid") === "presentationLearnableCard") {
            nextButton?.dispatchEvent(keyboardEventEnter);
        } else if (question?.getAttribute("data-testid") === "testLearnableCard") {
            const word = document.querySelector("#__next > div.sc-35r7d9-0.cMleEG > div > div > div > div > div > div.sc-1rrao7o-2.dKbScP > div > div.sc-1fe58ld-0.bUVnxj > div > div.sc-1jv6lv2-0.ffRZOV > h2")
            let answer = learnableDict[word?.textContent] || learnableDictInverted[word?.textContent];
            const options = document.querySelector("#__next > div.sc-35r7d9-0.cMleEG > div > div > div > div > div > div.sc-1rrao7o-2.dKbScP > div > div.sc-1fe58ld-0.bUVnxj > div > div.sc-9xkdxd-0.exhmot")
            const optionsList = options?.querySelectorAll("button")
            console.log(optionsList);
            if (optionsList?.length != undefined) {
                for (const option of optionsList) {
                    if (option.children[1].textContent === answer) {
                        option.focus();
                        option.dispatchEvent(keyboardEventEnter);
                    }
                }
            } else if (document.querySelector("#__next > div.sc-35r7d9-0.cMleEG > div > div > div > div > div > div.sc-1rrao7o-2.dKbScP > div > div.sc-1fe58ld-0.bUVnxj > div > div.sc-14we0e0-0.cxjNa-D > div.sc-14we0e0-1.cEcjTC")?.getAttribute("data-testid") === "tapping-response-answer") {
                let tappables = {};
                let actualWord = word.children[0].textContent;
                answer = tappableLearnables[actualWord]|| tappableLearnablesDefs[actualWord];

                for (const button of document.querySelector("#__next > div.sc-35r7d9-0.cMleEG > div > div > div > div > div > div.sc-1rrao7o-2.dKbScP > div > div.sc-1fe58ld-0.bUVnxj > div > div.sc-14we0e0-0.cxjNa-D > div.sc-14we0e0-1.dyBcnr").children) {
                    tappables[button.textContent] = button;
                }
                // console.log(tappables);
                console.log(answer)
                for (const part of answer) {
                    console.log(tappables[part])
                    tappables[part]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }
                nextButton?.dispatchEvent(keyboardEventEnter);
            }
            else {
                const typing = document.querySelector("#__next > div.sc-35r7d9-0.cMleEG > div > div > div > div > div > div.sc-1rrao7o-2.dKbScP > div > div.sc-1fe58ld-0.bUVnxj > div > div.sc-1v1crxt-0.icyQpU > div.sc-1v1crxt-7.kXOkVM > div > input")
                typing?.focus();
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(typing, answer);
                const typingEvent = new Event('input', { bubbles: true});
                typing.dispatchEvent(typingEvent);
                
            }
        }
    }, 1000);
})();
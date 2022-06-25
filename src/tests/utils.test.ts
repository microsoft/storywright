import {partitionArray} from "../utils";

test('string returning hello there jest', () => {
    expect(partitionArray(["a","b","c","d","e","f","g","h","i","j","k","l","m",],2,4)).toEqual(["e","f","g","h"]);
});

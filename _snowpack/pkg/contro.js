/*!
 * Contro
 * (c) 2020 Niklas Higi
 * Released under the MIT License.
 */
const store = {
    preferGamepad: false,
};

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

/**
 * A map of all the supported key values (property names) and their respective
 * aliases (property values)  that can be used with the `Keyboard` class. The
 * first alias for each key value will be used as a label.
 */
const keyMap = {
    ' ': ['Space', 'Spacebar', 'Space Bar'],
    'AltGraph': ['Alt Gr'],
    'ArrowDown': ['Down'],
    'ArrowLeft': ['Left'],
    'ArrowRight': ['Right'],
    'ArrowUp': ['Up'],
    'Backspace': ['Backspace'],
    'Control': ['Ctrl', 'Ctl'],
    'Delete': ['Delete', 'Del'],
    'Enter': ['Enter', 'Return'],
    'Escape': ['Escape', 'Esc'],
    'Insert': ['Insert', 'Ins'],
    'PageDown': ['Page Down', 'PgDown'],
    'PageUp': ['Page Up', 'PgUp'],
    'Tab': ['Tab'],
};
function findKeyValue(keyString) {
    if (keyString.length === 1)
        return keyString.toLowerCase();
    for (const keyValue in keyMap) {
        for (const key of keyMap[keyValue]) {
            if (keyString.toLowerCase() === key.toLowerCase()) {
                return keyValue;
            }
        }
    }
    return keyString;
}
function getKeyLabel(key) {
    if (key in keyMap)
        return keyMap[key][0];
    if (key.length === 1)
        return key.toUpperCase();
    return key;
}

const arrowKeyTemplates = {
    arrows: ['Arrow keys', ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']],
    wasd: ['WASD', ['W', 'A', 'S', 'D']],
};
class Keyboard {
    constructor(
    { doc = document } = {}) {
        this.pressedKeys = new Set();
        this.queuedKeys = new Set();
        this.document = doc;
        this.document.addEventListener('keydown', (event) => {
            store.preferGamepad = false;
            let key = event.key;
            if (key === key.toUpperCase())
                key = key.toLowerCase();
            this.pressedKeys.add(key);
            this.queuedKeys.add(key);
            return false;
        });
        this.document.addEventListener('keyup', (event) => {
            store.preferGamepad = false;
            let key = event.key;
            if (key === key.toUpperCase())
                key = key.toLowerCase();
            this.pressedKeys.delete(key);
            this.queuedKeys.delete(key);
            return false;
        });
    }
    key(key) {
        const keyValue = findKeyValue(key);
        const label = getKeyLabel(keyValue);
        return {
            label: getKeyLabel(keyValue),
            query: () => this.pressedKeys.has(keyValue),
            trigger: {
                label,
                query: () => this.queuedKeys.delete(keyValue),
            },
        };
    }
    directionalKeys(keys, label) {
        let defaultLabel;
        let keyValues;
        if (typeof keys === 'string') {
            const templateId = keys.toLowerCase();
            if (templateId in arrowKeyTemplates) {
                const template = arrowKeyTemplates[templateId];
                defaultLabel = template[0];
                keyValues = template[1];
            }
            else {
                throw new Error(`Directional key template "${keys}" not found!`);
            }
        }
        else {
            if (keys.length === 4) {
                keyValues = keys.map(key => findKeyValue(key));
                defaultLabel = keys.map(key => getKeyLabel(key)).join('');
            }
            else {
                throw new Error('Directional key templates have to consist of four keys!');
            }
        }
        return {
            label: label || defaultLabel,
            query: () => {
                const vector = new Vector2();
                if (this.key(keyValues[0]).query())
                    vector.y -= 1; // Up
                if (this.key(keyValues[1]).query())
                    vector.x -= 1; // Left
                if (this.key(keyValues[2]).query())
                    vector.y += 1; // Down
                if (this.key(keyValues[3]).query())
                    vector.x += 1; // Right
                return vector;
            },
        };
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * A map of all the supported button numbers (array indices) and their
 * respective aliases (the strings in the arrays) that can be used with the
 * `Gamepad` class. The first alias for each button will be used as a label.
 */
const buttonMap = [
    ['A'],
    ['B'],
    ['X'],
    ['Y'],
    ['Left Bumper', 'LB'],
    ['Right Bumper', 'RB'],
    ['Left Trigger', 'LT'],
    ['Right Trigger', 'RT'],
    ['Back', 'View'],
    ['Start'],
    ['Left Stick'],
    ['Right Stick'],
    ['Up', 'DpadUp'],
    ['Down', 'DpadDown'],
    ['Left', 'DpadLeft'],
    ['Right', 'DpadRight'],
    ['Home', 'Guide', 'Xbox'],
];
function findButtonNumber(button) {
    if (typeof button === 'number')
        return button;
    let buttonNumber = 0;
    for (const buttonAliases of buttonMap) {
        for (const buttonAlias of buttonAliases) {
            if (button.toLowerCase() === buttonAlias.toLowerCase()) {
                return buttonNumber;
            }
        }
        buttonNumber++;
    }
    throw new Error(`There is no gamepad button called "${button}"!`);
}
function getButtonLabel(button) {
    return buttonMap[button][0];
}

const gamepadSticks = {
    left: { label: 'Left stick', xAxis: 0, yAxis: 1 },
    right: { label: 'Right stick', xAxis: 2, yAxis: 3 },
};
class Gamepad {
    constructor(
    { win = window, nav = navigator } = {}) {
        this.pressedButtons = new Set();
        this.gamepadTimestamp = 0;
        this.window = win;
        this.navigator = nav;
        this.window.addEventListener('gamepadconnected', ({ gamepad }) => {
            if (this.isConnected())
                return;
            if (gamepad.mapping === 'standard') {
                this.gamepadIndex = gamepad.index;
                store.preferGamepad = true;
            }
        });
        this.window.addEventListener('gamepaddisconnected', ({ gamepad }) => {
            if (this.gamepadIndex !== gamepad.index)
                return;
            this.gamepadIndex = undefined;
            store.preferGamepad = false;
        });
    }
    isConnected() {
        return this.gamepadIndex !== undefined && this.gamepad.connected;
    }
    get gamepad() {
        const gamepad = this.navigator.getGamepads()[this.gamepadIndex];
        if (gamepad.timestamp > this.gamepadTimestamp) {
            store.preferGamepad = true;
            this.gamepadTimestamp = gamepad.timestamp;
        }
        return gamepad;
    }
    button(button) {
        const buttonNumber = findButtonNumber(button);
        const label = getButtonLabel(buttonNumber);
        return {
            label,
            query: () => {
                if (!this.isConnected())
                    return false;
                return this.gamepad.buttons[buttonNumber].pressed;
            },
            fromGamepad: true,
            trigger: {
                label,
                query: () => {
                    if (!this.isConnected())
                        return false;
                    if (this.gamepad.buttons[buttonNumber].pressed) {
                        if (this.pressedButtons.has(buttonNumber))
                            return false;
                        this.pressedButtons.add(buttonNumber);
                        return true;
                    }
                    this.pressedButtons.delete(buttonNumber);
                    return false;
                },
                fromGamepad: true,
            },
        };
    }
    stick(stick) {
        let gpStick;
        if (typeof stick === 'string') {
            if (stick in gamepadSticks) {
                gpStick = gamepadSticks[stick];
            }
            else {
                throw new Error(`Gamepad stick "${stick}" not found!`);
            }
        }
        else {
            gpStick = stick;
        }
        return {
            label: gpStick.label,
            query: () => {
                if (!this.isConnected())
                    return new Vector2(0, 0);
                return new Vector2(this.gamepad.axes[gpStick.xAxis], this.gamepad.axes[gpStick.yAxis]);
            },
        };
    }
    vibrate(duration, { weakMagnitude, strongMagnitude } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected())
                return;
            const actuator = this.gamepad.vibrationActuator;
            if (!actuator || actuator.type !== 'dual-rumble')
                return;
            yield actuator.playEffect('dual-rumble', {
                duration, strongMagnitude, weakMagnitude,
            });
        });
    }
}

function or(...controls) {
    if (controls.length < 2)
        throw new Error('Less than two controls specified!');
    return {
        get label() {
            const hasGamepadControls = controls.some(control => control.fromGamepad);
            if (!hasGamepadControls)
                return controls[0].label;
            return (store.preferGamepad
                ? controls.find(control => control.fromGamepad)
                : controls.find(control => !control.fromGamepad)).label;
        },
        query: () => {
            let sampleQueryValue;
            for (const control of controls) {
                const queryValue = control.query();
                sampleQueryValue = queryValue;
                if (queryValue)
                    return queryValue;
            }
            if (typeof sampleQueryValue === 'boolean')
                return false;
        },
    };
}

export { Gamepad, Keyboard, or };

import { Gamepad, Keyboard, or as controlsOr } from "contro";
import _ from "lodash";

const keyboard = new Keyboard();
const gamepad = new Gamepad();

const defaultControls = {
    general: {
        jump: "Space A",
        inventory: "E LB",
        crouch: "Shift B"
    },
    special: {
        directionalKeys: keyboard.directionalKeys("wasd")
    }
};

export const activeControls = {
    ..._.mapValues(defaultControls.general, (val => {
        const [keyboardKey, gamepadButton] = val.split(" ");
        return controlsOr(
            keyboard.key(keyboardKey),
            gamepadButton ? gamepad.button(gamepadButton) : undefined
        );
    })),
    ...{
        movement: controlsOr(
            defaultControls.special.directionalKeys,
            gamepad.stick("left")
        )
    }
};
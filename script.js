// JavaScript File for PicoHIDWeb
// Author - WireBits

function convertMnemonics() {
    var mnemonicsContent = document.getElementById("mnemonicsArea").value;
    const hidKeys = {
        'A': 'Keycode.A', 'B': 'Keycode.B', 'C': 'Keycode.C', 'D': 'Keycode.D', 'E': 'Keycode.E',
        'F': 'Keycode.F', 'G': 'Keycode.G', 'H': 'Keycode.H', 'I': 'Keycode.I', 'J': 'Keycode.J',
        'K': 'Keycode.K', 'L': 'Keycode.L', 'M': 'Keycode.M', 'N': 'Keycode.N', 'O': 'Keycode.O',
        'P': 'Keycode.P', 'Q': 'Keycode.Q', 'R': 'Keycode.R', 'S': 'Keycode.S', 'T': 'Keycode.T',
        'U': 'Keycode.U', 'V': 'Keycode.V', 'W': 'Keycode.W', 'X': 'Keycode.X', 'Y': 'Keycode.Y',
        'Z': 'Keycode.Z', 'F1': 'Keycode.F1', 'F2': 'Keycode.F2', 'F3': 'Keycode.F3', 'F4': 'Keycode.F4',
        'F5': 'Keycode.F5', 'F6': 'Keycode.F6', 'F7': 'Keycode.F7', 'F8': 'Keycode.F8', 'F9': 'Keycode.F9',
        'F10': 'Keycode.F10', 'F11': 'Keycode.F11', 'F12': 'Keycode.F12', 'LEFT': 'Keycode.LEFT_ARROW',
        'UP': 'Keycode.UP_ARROW', 'RIGHT': 'Keycode.RIGHT_ARROW', 'DOWN': 'Keycode.DOWN_ARROW',
        'TAB': 'Keycode.TAB', 'HOME': 'Keycode.HOME', 'END': 'Keycode.END', 'PGUP': 'Keycode.PAGE_UP',
        'PGDN': 'Keycode.PAGE_DOWN', 'CAPS': 'Keycode.CAPS_LOCK', 'NUM': 'Keycode.KEYPAD_NUMLOCK',
        'SCROLL': 'Keycode.SCROLL_LOCK', 'CTRL': 'Keycode.CONTROL', 'SHIFT': 'Keycode.SHIFT', 'ALT': 'Keycode.ALT',
        'GUI': 'Keycode.GUI', 'ESC': 'Keycode.ESCAPE', 'PRTSCR': 'Keycode.PRINT_SCREEN', 'PAUSE': 'Keycode.PAUSE',
        'SPACE': 'Keycode.SPACE', 'DEL': 'Keycode.DELETE', 'INSERT': 'Keycode.INSERT', 'BKSP': 'Keycode.BACKSPACE',
        'ENTER': 'Keycode.ENTER', 'APP': 'Keycode.APPLICATION'
    };

    function convertText(text) {
        var result = [];
        var lines = text.split('\n');
        var typeBuffer = '';
        var inLoop = false;
        var loopContent = [];
        var loopCount = 0;
        var inInfLoop = false;
        var infLoopContent = [];

        lines.forEach((line, index) => {
            line = line.trim();

            if (line.startsWith('LOOP ')) {
                let parts = line.split(' ');
                loopCount = parseInt(parts[1], 10);
                inLoop = true;
                loopContent = [];
            } else if (line === 'END') {
                if (inLoop) {
                    result.push(`for _ in range(${loopCount}):`);
                    result = result.concat(loopContent.map(line => '    ' + convertText(line).split('\n').join('\n    ')));
                    inLoop = false;
                }
            } else if (line.startsWith('INF')) {
                inInfLoop = true;
                infLoopContent = [];
            } else if (line === 'EXIT') {
                if (inInfLoop) {
                    result.push('while True:');
                    result = result.concat(infLoopContent.map(line => '    ' + convertText(line).split('\n').join('\n    ')));
                    inInfLoop = false;
                }
            } else if (inLoop) {
                loopContent.push(line);
            } else if (inInfLoop) {
                infLoopContent.push(line);
            } else if (line.startsWith('TYPE ')) {
                if (typeBuffer) {
                    result.push(`layout.write("${typeBuffer.trim()}")`);
                }
                let parts = line.substring(5).split(' -');
                typeBuffer = parts[0].replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                if (parts.length > 1) {
                    result.push(`layout.write("${typeBuffer}\\n")`);
                    typeBuffer = '';
                }
            } else {
                if (typeBuffer) {
                    result.push(`layout.write("${typeBuffer.trim()}")`);
                    typeBuffer = '';
                }
                if (line === 'ENTER') {
                    result.push('kbd.press(Keycode.ENTER)\nkbd.release_all()');
                } else if (line.startsWith('MOVE ')) {
                    try {
                        let parts = line.split(' ');
                        let x = parseInt(parts[1], 10);
                        let y = parseInt(parts[2], 10);
                        let w = parseInt(parts[3], 10);
                        result.push(`mse.move(${x}, ${y}, ${w})`);
                    } catch {
                        result.push("Invalid parameters for MOVE command!");
                    }
                } else if (line.startsWith('CLICK ')) {
                    let button = line.split(' ')[1];
                    switch (button) {
                        case 'LEFT':
                            result.push('mse.click(Mouse.LEFT_BUTTON)');
                            break;
                        case 'MIDDLE':
                            result.push('mse.click(Mouse.MIDDLE_BUTTON)');
                            break;
                        case 'RIGHT':
                            result.push('mse.click(Mouse.RIGHT_BUTTON)');
                            break;
                        default:
                            result.push("Invalid parameters for CLICK command!");
                            break;
                    }
                } else if (line.startsWith('PRESS ')) {
                    let button = line.split(' ')[1];
                    switch (button) {
                        case 'LEFT':
                            result.push('mse.press(Mouse.LEFT_BUTTON)\nmse.release_all()');
                            break;
                        case 'MIDDLE':
                            result.push('mse.press(Mouse.MIDDLE_BUTTON)\nmse.release_all()');
                            break;
                        case 'RIGHT':
                            result.push('mse.press(Mouse.RIGHT_BUTTON)\nmse.release_all()');
                            break;
                        default:
                            result.push("Invalid parameters for PRESS command!");
                            break;
                    }
                } else if (line in hidKeys) {
                    result.push(`kbd.press(${hidKeys[line]})\nkbd.release_all()`);
                } else {
                    result.push(convertLine(line));
                }
            }
        });

        if (typeBuffer) {
            result.push(`layout.write("${typeBuffer.trim()}")`);
        }

        return result.join('\n');
    }

    function convertLine(line) {
        var convertedLine = line
            .replace(/TIME/g, "import time")
            .replace(/HWD/g, "import board\nimport digitalio")
            .replace(/HID/g, "import usb_hid")
            .replace(/KEYBOARD/g, "from adafruit_hid.keycode import Keycode\nfrom adafruit_hid.keyboard import Keyboard\nfrom adafruit_hid.keyboard_layout_us import KeyboardLayoutUS\n\nkbd = Keyboard(usb_hid.devices)\nlayout = KeyboardLayoutUS(kbd)")
            .replace(/MOUSE/g, "from adafruit_hid.mouse import Mouse\n\nmse = Mouse(usb_hid.devices)")
            .replace(/PIN/g, "led = digitalio.DigitalInOut(board.LED)\nled.direction = digitalio.Direction.OUTPUT")
            .replace(/LED (ON|OFF)/g, function(match, p1) {
                return p1 === "ON" ? "led.value = 1" : "led.value = 0";
            })
            .replace(/WAIT (\d+)/g, function(_match, p1) {
                var delayTime = parseInt(p1, 10);
                return `time.sleep(${delayTime / 1000})`;
            });

        var keys = convertedLine.split(' ');
        var keySequence = keys.map(key => hidKeys[key]).filter(key => key !== undefined);
        var formattedSequence = keySequence.join(', ');

        if (formattedSequence.length > 0) {
            return `kbd.press(${formattedSequence})\nkbd.release_all()`;
        } else {
            return convertedLine;
        }
    }

    var convertedContent = convertText(mnemonicsContent);
    document.getElementById("picoArea").value = convertedContent;
}

function copyPicoArea() {
    var content = document.getElementById("picoArea").value;
    navigator.clipboard.writeText(content);
}

function resetTextArea() {
    document.getElementById("mnemonicsArea").value = '';
    document.getElementById("picoArea").value = '';
}

function saveFile() {
    var content = document.getElementById("picoArea").value;
    var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "code.py";
    link.click();
}

function handleFileSelect(event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function(event) {
        document.getElementById('mnemonicsArea').value = event.target.result;
    };
    reader.readAsText(file);
}

function triggerFileInput() {
    document.getElementById('fileInput').click();
}
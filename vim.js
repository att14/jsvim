var buffer = function (spec) {
    var that = {},
        height = spec.height,
        docWidth = spec.width,
        container = spec.container,
        lineHeight = spec.lineHeight,
        dom = $('<div></div>').addClass('buffer'),
        actualHeight = (height - (height % lineHeight)) - lineHeight,
        line = function (spec) {
            var that = {},
                lineNum = spec.lineNum,
                lineHeight = spec.lineHeight,
                character = function () {
                    var that = {},
                        charWidth = lineHeight / 2;

                    that.dom = $('<div></div>').addClass('char')
                                               .width(charWidth)
                                               .height(lineHeight);
                    that.cursorOn = function () {
                        that.dom.removeClass('cursor-off').addClass('cursor-on');
                    }
                    that.cursorOff = function () {
                        that.dom.removeClass('cursor-on').addClass('cursor-off');
                    }
                    that.insert = function (symbol) {
                        that.dom.text(symbol);
                    }

                    return that
                };

            that.characters = [];
            that.addCharacter = function (spec) {
                var newCharacter = character();
                that.characters.push(newCharacter);
                return newCharacter;
            };
            that.addCharacter({charNum: 0})

            that.dom = $('<div></div>').addClass('line' + lineNum)
                                       .height(lineHeight);

            return that;
        },
        createLines = function () {
            var lines = [], i;
            for (i = 0; i < (actualHeight / lineHeight); i++) {
                lines.push(
                    line({
                        lineNum: i,
                        lineHeight: lineHeight
                    })
                );
            }
            return lines;
        },
        statusLine = function (spec) {
            var that = {},
                lineHeight = spec.lineHeight;

            that.dom = $('<div></div>').addClass('status-line')
                                       .append('<div class="mode">NORMAL</div>');

            return that;
        };

    that.lines = createLines();
    that.statusLine = statusLine({
        lineHeight: lineHeight
    });
    that.draw = function () {
        var currentLine, i, j;
        for (i = 0; i < that.lines.length; i++) {
            currentLine = that.lines[i];
            for (j = 0; j < currentLine.characters.length; j++) {
                currentLine.dom.append(currentLine.characters[j].dom);
            }
            dom.append(currentLine.dom);
        }
        dom.append(that.statusLine.dom);
        container.append(dom);
    };

    return that;
},
    createCursor = function (spec) {
        var that = {},
            x = spec.x,
            y = spec.y,
            buffer = spec.buffer,
            interval = spec.interval,
            line = buffer.lines[x],
            character = line.characters[y],
            flashOn = function () {
                character.cursorOn();
                setTimeout(flashOff, interval);
            },
            flashOff = function () {
                character.cursorOff();
                setTimeout(flashOn, interval);
            },
            moveCursorLeft = function () {
                var oldCharacter;
                x++;
                oldCharacter = character;
                character = line.addCharacter({charNum: line.characters.length});
                oldCharacter.dom.removeClass('cursor-off').removeClass('cursor-on');
                buffer.draw()
            };

        that.insert = function (symbol) {
            character.insert(symbol);
            moveCursorLeft();
        };

        flashOn();
        return that;
    }

$(document).ready(function () {
    'use strict'
    var currentBuffer = buffer({
        container: $('body'),
        lineHeight: 20,
        height: this.height,
        width: this.witdh
    }),
        cursor = createCursor({
            x:0,
            y:0,
            interval: 1000,
            buffer: currentBuffer
        }),
        buffers = [currentBuffer];

    $(document).keypress(function () {
        var mode = $('.mode');
        if (mode.html() == 'NORMAL') {
            if (event.charCode == 105) {
                mode.html('INSERT');
            }
        } else {
            cursor.insert(String.fromCharCode(event.charCode));
        }
    });

    currentBuffer.draw();
});

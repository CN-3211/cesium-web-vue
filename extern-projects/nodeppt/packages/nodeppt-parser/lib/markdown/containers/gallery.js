const name = 'gallery';

module.exports = {
    validate(params) {
        return params.trim().match(/^gallery(|-overlay)\s*(.*)$/);
    },
    handler(state, opts) {
        const m = opts.match(/^gallery(|-overlay)\s*(.*)$/);
        if (m && m[1]) {
            opts = m[1].trim();
        }
        function getOpenToken(tag, level) {
            const token = new state.Token('container_' + name + '_' + tag + '_open', tag, 1);
            token.block = true;
            token.level = 1 + level;
            return token;
        }
        function getCloseToken(tag, level) {
            const token = new state.Token('container_' + name + '_' + tag + '_close', tag, -1);
            token.block = true;
            token.level = 1 + level;
            return token;
        }
        // tokens
        const tokens = state.tokens;
        // console.log(opts);
        let open = false;
        let done = 0;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.type === 'container_' + name + '_open') {
                // 在 open 后面插入
                tokens.splice(i + 1, 0, getOpenToken('li', token.level), getOpenToken('a', token.level + 1));
                open = true;
                i = i + 2;
            } else if (token.type === 'container_' + name + '_close') {
                // 在 close 之前插入
                tokens.splice(i, 0, getCloseToken('a', token.level + 1), getCloseToken('li', token.level));
                open = false;
                i = i + 2;
            } else if (open && 'hr' === token.type && done === 0) {
                // 第一层的 Hr 需要替换
                tokens.splice(
                    i,
                    1,
                    getCloseToken('a', token.level),
                    getCloseToken('li', token.level - 1),
                    getOpenToken('li', token.level - 1),
                    getOpenToken('a', token.level)
                );
                i = i + 3;
            } else if (open) {
                // 加深一层，因为外面多套了一层div
                token.level = token.level + 2;
                // 保证hr 是最贴近 container 的一层
                if (/_open$/.test(token.type)) {
                    done++;
                } else if (/_close$/.test(token.type)) {
                    done--;
                }

                // 确定下一个是 img
                const nextToken = tokens[i + 1];
                if (
                    token.type === 'paragraph_open' &&
                    nextToken.type === 'inline' &&
                    /^\!\[]\(.+\)$/.test(nextToken.content)
                ) {
                    let level = token.level - 1;
                    // 替换掉 paragraph_open
                    tokens.splice(i, 1, getOpenToken('figure', level));
                    // 替换掉 paragraph_close
                    tokens.splice(i + 2, 1, getCloseToken('figure', level - 2));

                    const tt = [];
                    for (let j = i + 3; j < tokens.length; j++) {
                        const temp = tokens[j];
                        if (temp.type === 'hr' || temp.type === 'container_gallery_close') {
                            tokens.splice(i + 3, tt.length);
                            let openTag, closeTag;
                            if (opts === 'gallery-overlay') {
                                openTag = getOpenToken('div', token.level - 2);
                                closeTag = getCloseToken('div', token.level - 2);
                                openTag.attrPush(['class', 'overlay']);
                            } else {
                                openTag = getOpenToken('figcaption', token.level - 2);
                                closeTag = getCloseToken('figcaption', token.level - 2);
                            }
                            // 到头了
                            tokens.splice(i + 2, 0, openTag, ...tt, closeTag);
                            // i = i + 4 + tt.length;
                            break;
                        }

                        // 加深2层
                        temp.level = temp.level + 2;
                        tt.push(temp);
                    }
                }
            }
        }
        // console.log(tokens);
        return state;
    },
    render(tokens, idx) {
        const token = tokens[idx];

        if (token.nesting === 1) {
            const cmIndex = token.attrIndex('css-module');
            let clsIndex = token.attrIndex('class');
            let attrs = token.attrs || [];

            if (clsIndex >= 0) {
                attrs[clsIndex][1] += cmIndex >= 0 ? ` flexblock gallery ${attrs[cmIndex][1]}` : ` flexblock gallery`;
            } else {
                attrs.push(['class', cmIndex >= 0 ? `flexblock gallery ${attrs[cmIndex][1]}` : `flexblock gallery`]);
            }

            attrs = attrs.map(([key, value]) => {
                return `${key}="${value}"`;
            });
            // opening tag
            return `<ul ${attrs.join(' ')}>\n`;
        } else {
            // closing tag
            return '</ul>\n';
        }
    }
};

function mmd(src) {
	var h = '';

	function replaceAll(txt, find, replace) {
		var i, j;

		if (typeof find === 'string') { return txt.split(find).join(replace); }
		while (typeof(i = find.shift()) === 'string' && typeof(j = replace.shift()) === 'string') {
			txt = replaceAll(txt, i || '', j || '');
		}
		return txt;
	}

	function html(input) {
		return replaceAll(input.toString(), ['&', '<', '"'], ['&amp;', '&lt;', '&quot;']);
	}

    //if there's any anchor elements in the text, convert them to markdown first
    function convertLinks(s){
    	var pattern = /<a.+?href=[\'\"](.+?)[\'\"].*?>(.*?)<\/a>/gi;
    	return s.replace(pattern, '[$2]($1)');
    }

    src = convertLinks(src);


    function inlineEscape(s) {
        return s.split('`').map(function(val, i, arr) {
            if (i % 2) return '<code>' + html(val) + '</code>';
            else {
                return html(val)
                    .replace(/!\[([^\]]+)]\(([^\s("&]+\.[^\s("&]+)\)/g, '<img alt="$1" src="$2" />')
                    .replace(/\[([^\]]+)]\(([^\s("&]+\.[^\s("&]+)\)/g, '$1'.link('$2'))
                    .replace(/([^;["])(https?:\/\/([^\s("&]+\.[^\s("&]+))/g, '$1' + '$3'.link('$2'))
                    .replace(/^(https?:\/\/([^\s("&]+\.[^\s("&]+))/g, '$2'.link('$1'))
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*([^*]+)\*/g, '<em>$1</em>') + (i == arr.length - 1 && i != 0 ? '</code>' : '');
            }
        }).join('');
    }

    if (!src.match(/\n\n+/) && src.substr(0, 2) != '> ') {
        return inlineEscape(src);
    }

    src.replace(/\r|\s+$/g, '').replace(/\t/g, '    ').split(/\n\n+/).forEach(function(b, f, R) {
        var f = b.substr(0, 2),
            R = {
                '* ': [(/\n\* /), '<ul><li>', '</li></ul>'],
                '- ': [(/\n- /), '<ul><li>', '</li></ul>'],
                '  ': [(/\n {4}/),'<pre><code>', '</code></pre>', '\n'],
                '> ': [(/\n> /),'<blockquote>', '</blockquote>', '\n']
            }[f];
        if (!R && b.match(/\n[1-9]\d*\. /)) R = [(/\n[1-9]\d*\. /), '<ol><li>', '</li></ol>'];
        else if (!R && b.match(/\n[1-9]\d*\) /)) R = [(/\n[1-9]\d*\) /), '<ol><li>', '</li></ol>'];
        f = b[0];
        if (R) h += R[1] + ('\n' + b).split(R[0]).slice(1).map(R[3] ? html : inlineEscape).join(R[3] || '</li>\n<li>') + R[2];
        else if (f == '#') h += '<h' + Math.min(6, f = b.indexOf(' ')) + '>' + inlineEscape(b.slice(f + 1)) + '</h' + Math.min(6, f) + '>';
        else h += '<p>' + inlineEscape(b) + '</p>';
    });

	return h;
}

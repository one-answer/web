import { html } from "hono/html";
import { BaseProps } from "../route/base";
import Header from "./header"
import Footer from "./footer"

export default function (z: BaseProps) {
    z.i = z.i! // 非空断言
    return html`
        ${Header(z)}
        <main class="container">
            <form onsubmit="event.preventDefault(); login(this);">
                <input type="submit" value="保存" />
                <a href="javascript:history.back()">返回</a>
                <br />
                邮箱：<input type="text" name="mail" value="${z.i.email}" /><br />
                昵称：<input type="text" name="name" value="${z.i.username}" /><br />
                密码：<input type="password" name="pass" /><br />
                重复：<input type="password" name="pass_confirm" /><br />
                ID：${z.i.uid}<br />
                经验：${z.i.credits}<br />
                金币：${z.i.golds}<br />
                主题：${z.i.threads}<br />
                回复：${z.i.posts}<br />
                职务：${z.i.gid}<br />
                <b>注意：页面尚未完成，仅供查看，现在提交什么也修改不了！</b>
            </form>
            <script>
                // 祖传大坨MD5
                function md5(r){function n(r,n){var t=(65535&r)+(65535&n);return(r>>16)+(n>>16)+(t>>16)<<16|65535&t}function t(r,t,u,e,a,c){var f=n(n(t,r),n(e,c));return n(f<<a|f>>>32-a,u)}function u(r,n,u,e,a,c,f){return t(n&u|~n&e,r,n,a,c,f)}function e(r,n,u,e,a,c,f){return t(n&e|u&~e,r,n,a,c,f)}function a(r,n,u,e,a,c,f){return t(n^u^e,r,n,a,c,f)}function c(r,n,u,e,a,c,f){return t(u^(n|~e),r,n,a,c,f)}for(var f=Array(),o=8*r.length,i=1732584193,h=-271733879,v=-1732584194,A=271733878,d=0;d<o;d+=8)f[d>>5]|=(255&r.charCodeAt(d/8))<<d%32;f[o>>5]|=128<<o%32,f[14+(o+64>>>9<<4)]=o;for(d=0;d<f.length;d+=16){var g=i,l=h,y=v,b=A;h=c(h=c(h=c(h=c(h=a(h=a(h=a(h=a(h=e(h=e(h=e(h=e(h=u(h=u(h=u(h=u(h,v=u(v,A=u(A,i=u(i,h,v,A,f[d+0],7,-680876936),h,v,f[d+1],12,-389564586),i,h,f[d+2],17,606105819),A,i,f[d+3],22,-1044525330),v=u(v,A=u(A,i=u(i,h,v,A,f[d+4],7,-176418897),h,v,f[d+5],12,1200080426),i,h,f[d+6],17,-1473231341),A,i,f[d+7],22,-45705983),v=u(v,A=u(A,i=u(i,h,v,A,f[d+8],7,1770035416),h,v,f[d+9],12,-1958414417),i,h,f[d+10],17,-42063),A,i,f[d+11],22,-1990404162),v=u(v,A=u(A,i=u(i,h,v,A,f[d+12],7,1804603682),h,v,f[d+13],12,-40341101),i,h,f[d+14],17,-1502002290),A,i,f[d+15],22,1236535329),v=e(v,A=e(A,i=e(i,h,v,A,f[d+1],5,-165796510),h,v,f[d+6],9,-1069501632),i,h,f[d+11],14,643717713),A,i,f[d+0],20,-373897302),v=e(v,A=e(A,i=e(i,h,v,A,f[d+5],5,-701558691),h,v,f[d+10],9,38016083),i,h,f[d+15],14,-660478335),A,i,f[d+4],20,-405537848),v=e(v,A=e(A,i=e(i,h,v,A,f[d+9],5,568446438),h,v,f[d+14],9,-1019803690),i,h,f[d+3],14,-187363961),A,i,f[d+8],20,1163531501),v=e(v,A=e(A,i=e(i,h,v,A,f[d+13],5,-1444681467),h,v,f[d+2],9,-51403784),i,h,f[d+7],14,1735328473),A,i,f[d+12],20,-1926607734),v=a(v,A=a(A,i=a(i,h,v,A,f[d+5],4,-378558),h,v,f[d+8],11,-2022574463),i,h,f[d+11],16,1839030562),A,i,f[d+14],23,-35309556),v=a(v,A=a(A,i=a(i,h,v,A,f[d+1],4,-1530992060),h,v,f[d+4],11,1272893353),i,h,f[d+7],16,-155497632),A,i,f[d+10],23,-1094730640),v=a(v,A=a(A,i=a(i,h,v,A,f[d+13],4,681279174),h,v,f[d+0],11,-358537222),i,h,f[d+3],16,-722521979),A,i,f[d+6],23,76029189),v=a(v,A=a(A,i=a(i,h,v,A,f[d+9],4,-640364487),h,v,f[d+12],11,-421815835),i,h,f[d+15],16,530742520),A,i,f[d+2],23,-995338651),v=c(v,A=c(A,i=c(i,h,v,A,f[d+0],6,-198630844),h,v,f[d+7],10,1126891415),i,h,f[d+14],15,-1416354905),A,i,f[d+5],21,-57434055),v=c(v,A=c(A,i=c(i,h,v,A,f[d+12],6,1700485571),h,v,f[d+3],10,-1894986606),i,h,f[d+10],15,-1051523),A,i,f[d+1],21,-2054922799),v=c(v,A=c(A,i=c(i,h,v,A,f[d+8],6,1873313359),h,v,f[d+15],10,-30611744),i,h,f[d+6],15,-1560198380),A,i,f[d+13],21,1309151649),v=c(v,A=c(A,i=c(i,h,v,A,f[d+4],6,-145523070),h,v,f[d+11],10,-1120210379),i,h,f[d+2],15,718787259),A,i,f[d+9],21,-343485551),i=n(i,g),h=n(h,l),v=n(v,y),A=n(A,b)}var m=Array(i,h,v,A),C="0123456789abcdef",j="";for(d=0;d<4*m.length;d++)j+=C.charAt(m[d>>2]>>d%4*8+4&15)+C.charAt(m[d>>2]>>d%4*8&15);return j}
                async function login(form){
                    const data = new FormData(form);
                    data.set('pass', md5(data.get('pass')));
                    if ((await fetch(new Request("/iConf", {method: "POST", body: data}))).ok) {
                        window.location=document.referrer
                    } else { alert('登录失败'); }
                }
            </script>
        </main>
        ${Footer(z)}
    `;
}
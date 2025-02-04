import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { serveStatic } from 'hono/bun'
import { Config } from './base';
import { pOmit, pSave } from './pData';
import { iLogin, iLogout, iRegister, iSave } from './iData';
import { iAuth } from './iAuth';
import { iConf } from './iConf';
import { pEdit } from './pEdit';
import { nListInit, nListLessThan, nListMoreThan } from './nList';
import { pListInit, pListLessThan, pListMoreThan } from './pList';
import { tListInit, tListLessThan, tListMoreThan } from './tList';

export default await (async () => {

    await Config.init();
    const app = new Hono();
    app.use(csrf());

    app.get('/', tListInit);
    app.get('/m/:pivot{[0-9]+}?', tListMoreThan);
    app.get('/l/:pivot{[0-9]+}?', tListLessThan);

    app.get('/t/:tid{[0-9]+}', pListInit);
    app.get('/t/:tid{[0-9]+}/l/:pivot{[0-9]+}?', pListLessThan);
    app.get('/t/:tid{[0-9]+}/m/:pivot{[0-9]+}?', pListMoreThan);

    app.get('/e/:eid{[-0-9]+}?', pEdit);
    app.post('/e/:eid{[-0-9]+}?', pSave);
    app.delete('/e/:eid{[-0-9]+}?', pOmit);

    app.get('/n', nListInit);
    app.get('/n/m/:pivot{[0-9]+}?', nListMoreThan);
    app.get('/n/l/:pivot{[0-9]+}?', nListLessThan);

    app.get('/i', iConf);
    app.post('/i', iSave);
    app.get('/auth', iAuth);
    app.post('/login', iLogin);
    app.post('/logout', iLogout);
    app.post('/register', iRegister);

    app.use('/upload/*', serveStatic({ root: './' }));
    app.use('/*', serveStatic({ root: './const/' }));

    return app;

})();
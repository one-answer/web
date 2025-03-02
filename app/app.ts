import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { serveStatic } from 'hono/bun'
import { Config } from './core';
import { pOmit, pSave } from './pData';
import { iLogin, iLogout, iRegister, iSave } from './iData';
import { iAuth } from './iAuth';
import { iConf } from './iConf';
import { pEdit } from './pEdit';
import { pList } from './pList';
import { tList } from './tList';
import { tPeak } from './tData';

const hono = await (async () => {

    await Config.init();
    const app = new Hono();
    app.use(csrf());

    app.get('/:page{[0-9]+}?', tList);
    app.get('/t/:tid{[0-9]+}/:page{[0-9]+}?', pList);

    app.put('/t/:tid{[-0-9]+}?', tPeak);
    app.get('/e/:eid{[-0-9]+}?', pEdit);
    app.post('/e/:eid{[-0-9]+}?', pSave);
    app.delete('/e/:eid{[-0-9]+}?', pOmit);

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

export default {
    port: 3000,
    fetch: hono.fetch,
}
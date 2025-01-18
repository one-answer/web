import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { count } from 'drizzle-orm';
import { Config, Counter } from './core';
import { DB, Thread } from './base';
import { pEditData } from './pData';
import { iLoginData, iLogoutData } from './iData';
import iAuth from './iAuth';
import nList from './nList';
import pList from './pList';
import pEdit from './pEdit';
import pJump from './pJump';
import tList from './tList';

export default await (async () => {

    await Config.init()
    Counter.set('T', (await DB.select({ count: count() }).from(Thread))[0].count);

    const app = new Hono();

    app.get('/:page{[0-9]+}?', tList);
    app.get('/t/:tid{[0-9]+}/:page{[0-9]+}?', pList);
    app.get('/e/:eid{[-0-9]+}?', pEdit);
    app.post('/e/:eid{[-0-9]+}?', pEditData);
    app.get('/n/:page{[0-9]+}?', nList);
    app.get('/p', pJump);
    app.get('/auth', iAuth);
    app.post('/login', iLoginData);
    app.post('/logout', iLogoutData);

    app.use('/avatar/*', serveStatic({ root: './' }));
    app.use('/upload/*', serveStatic({ root: './' }));
    app.use('/*', serveStatic({ root: './static/' }));

    return app;

})();
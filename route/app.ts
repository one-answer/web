import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { count } from 'drizzle-orm';
import { Config, Counter } from './core';
import { DB, Thread } from './base';
import { tList } from './tList';
import pList from './pList';
import iAuth from './iAuth';
import pEdit from './pEdit';
import { pEditPost } from './pPost';
import { iLoginPost, iLogoutPost } from './iPost';

export default await (async () => {

    Config.init()
    new Counter('T').set((await DB.select({ count: count() }).from(Thread))[0].count);

    const app = new Hono();

    app.get('/:page{[0-9]+}?', tList);
    app.get('/t/:tid{[0-9]+}/:page{[0-9]+}?', pList);
    app.get('/e/:eid{[-0-9]+}?', pEdit);
    app.post('/e/:eid{[-0-9]+}?', pEditPost);
    app.get('/auth', iAuth);
    app.post('/login', iLoginPost);
    app.post('/logout', iLogoutPost);

    app.use('/avatar/*', serveStatic({ root: './' }));
    app.use('/upload/*', serveStatic({ root: './' }));
    app.use('/*', serveStatic({ root: './static/' }));

    return app;

})();
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { count } from 'drizzle-orm';
import { Config, Counter } from './core';
import { DB, Thread } from './base';
import tList from './tList';
import pList from './pList';

export default await (async () => {

    Config.init()
    new Counter('T').set((await DB.select({ count: count() }).from(Thread))[0].count);

    const app = new Hono();
    app.get('/', tList);
    app.get('/c/:page{[0-9]+}?', tList);
    app.get('/t/:tid{[0-9]+}', pList);
    app.get('/t/:tid{[0-9]+}/c/:page{[0-9]+}?', pList);
    app.use('/favicon.ico', serveStatic({ path: './static/favicon.ico' }));
    app.use('/style.css', serveStatic({ path: './static/style.css' }));

    return app;

})();
import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { serveStatic } from 'hono/bun'
import { count, eq } from 'drizzle-orm';
import { Config, Counter } from './base';
import { DB, Thread } from './data';
import { pOmit, pSave } from './pData';
import { iLogin, iLogout, iRegister, iSave } from './iData';
import { iAuth } from './iAuth';
import { iConf } from './iConf';
import { nList } from './nList';
import { pList } from './pList';
import { pEdit } from './pEdit';
import { pJump } from './pJump';
import { tList } from './tList';

export default await (async () => {

    await Config.init()
    Counter.set(0, (
        await DB.select({ count: count() })
            .from(Thread)
            .where(eq(Thread.access, 0))
    )[0].count);

    const app = new Hono();
    app.use(csrf())

    app.get('/:page{[0-9]+}?', tList);
    app.get('/t/:tid{[0-9]+}/:page{[0-9]+}?', pList);
    app.get('/p', pJump);
    app.get('/e/:eid{[-0-9]+}?', pEdit);
    app.post('/e/:eid{[-0-9]+}?', pSave);
    app.delete('/e/:eid{[-0-9]+}?', pOmit);
    app.get('/n/:page{[0-9]+}?', nList);
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
routerAdd('GET', '/gethost', async (c) => {
   return c.json(200, process.env.FLY_REGION);
})

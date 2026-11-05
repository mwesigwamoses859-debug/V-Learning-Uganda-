import {platformSchema,enqueueRenewals,dispatchNotifications} from '../server/platform.mjs';
export default {
  // This Worker has no public routes and never exposes the learner database.
  async fetch(){return new Response('Not found',{status:404});},
  async scheduled(controller,env){
    if(!env.DB)throw new Error('Notification database binding is missing.');
    await env.DB.batch(platformSchema.map(sql=>env.DB.prepare(sql)));
    await enqueueRenewals(env.DB);
    const result=await dispatchNotifications(env,{limit:5});
    console.log(JSON.stringify({job:'subscription-notifications',sent:result.sent,failed:result.failed,emailConfigured:result.configured}));
  },
};

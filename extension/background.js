// /* ───────── GLOBALS (in-memory) ───────── */
// let currentSessionId  = null;
// let currentBlocklist  = [];   // [{type:'website', value:'…'}, …]
// let authToken         = null;
// const dynamicRuleOffset = 10_000;

// chrome.runtime.onInstalled.addListener(() => {
//   console.log('FocusFlow Extension installed.');
// });


// /* ───────── UTIL: Normalise a domain ───────── */
// const normalizeDomain = (url) =>
//   url.replace(/^https?:\/\//i, '')
//      .replace(/^www\./i, '')
//      .split('/')[0]
//      .toLowerCase();

// const getDomainStrings = (list) => list.map(i => normalizeDomain(i.value));

// /* ───────── HELPER: Reload affected tabs ───────── */
// function reloadTabsMatchingDomains(domainStrings) {
//   if (!domainStrings.length) return;
//   chrome.tabs.query({}, (tabs) => {
//     tabs.forEach(tab => {
//       if (!tab.url || !tab.id) return;
//       try {
//         const host = new URL(tab.url).hostname.replace(/^www\./, '').toLowerCase();
//         if (domainStrings.some(d => host === d || host.endsWith(`.${d}`))) {
//           chrome.tabs.reload(tab.id, { bypassCache: true });
//         }
//       } catch { /* ignore invalid URLs */ }
//     });
//   });
// }

// /* ───────── RULE HELPERS ───────── */
// function wipeAllDynRules(cb) {
//   const ids = Array.from({ length: 2000 }, (_, i) => dynamicRuleOffset + i + 1);
//   chrome.declarativeNetRequest.updateDynamicRules(
//     { removeRuleIds: ids, addRules: [] }, cb
//   );
// }

// function applyBlockRules(blocklist) {
//   const rules = blocklist.map((item, idx) => ({
//     id: dynamicRuleOffset + idx + 1,
//     priority: 1,
//     action:   { type: 'block' },
//     condition:{
//       urlFilter: `||${normalizeDomain(item.value)}`,
//       resourceTypes: ['main_frame']
//     }
//   }));

//   wipeAllDynRules(() => {
//     chrome.declarativeNetRequest.updateDynamicRules(
//       { removeRuleIds: [], addRules: rules },
//       () => {
//         if (chrome.runtime.lastError)
//           console.error('updateDynamicRules error:', chrome.runtime.lastError);
//         else
//           console.log('Dynamic rules applied:', rules.length);
//       }
//     );
//   });
// }

// /* ───────── PERSISTENCE ───────── */
// function saveStateToStorage() {
//   chrome.storage.local.set({
//     currentSessionId,
//     currentBlocklist,
//     authToken
//   });
// }

// function clearStateInStorage() {
//   chrome.storage.local.remove(['currentSessionId', 'currentBlocklist', 'authToken']);
// }

// /* Restore on service-worker start */
// chrome.storage.local.get(['currentSessionId', 'currentBlocklist', 'authToken'], (res) => {
//   if (res.currentSessionId && res.currentBlocklist) {
//     currentSessionId = res.currentSessionId;
//     currentBlocklist = res.currentBlocklist;
//     authToken        = res.authToken || null;
//     console.log('Restored session from storage:', currentSessionId);
//     applyBlockRules(currentBlocklist);
//   }
// });

// /* ───────── MESSAGE LISTENER ───────── */
// chrome.runtime.onMessage.addListener((msg) => {
//   /* ––– START ––– */
//   if (msg.type === 'START_SESSION') {
//     console.log('START_SESSION at extn', msg.payload);
//     const { sessionId, blocklist, token } = msg.payload;
//     authToken         = token;
//     currentSessionId  = sessionId;
//     currentBlocklist  = blocklist.filter(i => i.type === 'website');
//     applyBlockRules(currentBlocklist);
//     reloadTabsMatchingDomains(getDomainStrings(currentBlocklist));
//     saveStateToStorage();
//     return;
//   }

//   /* ––– UPDATE ––– */
//   if (msg.type === 'UPDATE_BLOCKLIST') {
//     const newList = msg.payload.filter(i => i.type === 'website');
//     const affected = [...new Set([
//       ...getDomainStrings(currentBlocklist),
//       ...getDomainStrings(newList)
//     ])];
//     currentBlocklist = newList;
//     applyBlockRules(currentBlocklist);
//     reloadTabsMatchingDomains(affected);
//     saveStateToStorage();
//     return;
//   }

//   /* ––– END ––– */
//   if (msg.type === 'END_SESSION') {
//     const domains = getDomainStrings(currentBlocklist);
//     wipeAllDynRules(() => console.log('Rules cleared'));
//     currentSessionId = null;
//     currentBlocklist = [];
//     authToken        = null;
//     reloadTabsMatchingDomains(domains);
//     clearStateInStorage();
//   }
// });

// /* ───────── INTERRUPT LOGGING ───────── */
// chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(async (info) => {
//   if (!currentSessionId || info.rule.ruleId < dynamicRuleOffset) return;
//   try {
//     await fetch(`http://localhost:8080/session/interrupt/${currentSessionId}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${authToken}`
//       }
//     });
//     console.log('Interruption logged for rule', info.rule.ruleId);
//   } catch (e) {
//     console.error('Failed logging interruption:', e);
//   }
// });











let currentSessionId = null;
let currentBlocklist = [];
const dynamicRuleOffset = 10_000;
let authToken = null;   // store JWT so extension can hit backend

/* ───────── UTIL: Normalize domain ───────── */
function normalizeDomain(url) {
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase();
}

/* ───────── UTIL: Extract domain strings from blocklist ───────── */
function getDomainStrings(list) {
  return list.map(item => normalizeDomain(item.value));
}

/* ───────── HELPER: Reload tabs that match domains ───────── */
function reloadTabsMatchingDomains(domainStrings) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (!tab.url || !tab.id) return;

      try {
        const hostname = new URL(tab.url).hostname.replace(/^www\./, '').toLowerCase();

        const shouldReload = domainStrings.some(domain =>
          hostname === domain || hostname.endsWith(`.${domain}`)
        );

        if (shouldReload) {
          chrome.tabs.reload(tab.id, { bypassCache: true });
        }
      } catch (e) {
        console.warn('Invalid tab URL:', tab.url);
      }
    });
  });
}

/* ───────── BLOCK RULES: Apply ───────── */
function applyBlockRules(blocklist) {
  console.log('Applying block rules:', blocklist);

  const newRules = blocklist.map((item, idx) => ({
    id: dynamicRuleOffset + idx + 1,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: `||${normalizeDomain(item.value)}`,
      resourceTypes: ['main_frame']
    }
  }));

  // Remove all previous session rules (safe upper bound)
  const idsToRemove = Array.from({ length: 2000 }, (_, i) => dynamicRuleOffset + i + 1);

  chrome.declarativeNetRequest.updateDynamicRules(
    { removeRuleIds: idsToRemove, addRules: newRules },
    () => {
      if (chrome.runtime.lastError) {
        console.error('updateDynamicRules error:', chrome.runtime.lastError);
      } else {
        console.log('Dynamic rules applied successfully');
      }
    }
  );
}

/* ───────── BLOCK RULES: Clear ───────── */
function clearBlockRules() {
  const idsToRemove = Array.from({ length: 2000 }, (_, i) => dynamicRuleOffset + i + 1);

  chrome.declarativeNetRequest.updateDynamicRules(
    { removeRuleIds: idsToRemove, addRules: [] },
    () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to clear rules:', chrome.runtime.lastError);
      } else {
        console.log('All dynamic rules cleared');
      }
    }
  );
}

/* ───────── MAIN: Message Listener ───────── */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_SESSION') {
    console.log('START_SESSION at extn', message.payload);
    authToken = message.payload.token; // Store auth token for backend requests
    const { sessionId, blocklist } = message.payload;
    const websiteBlocklist = blocklist.filter(i => i.type === 'website');

    currentSessionId = sessionId;
    currentBlocklist = websiteBlocklist;

    applyBlockRules(currentBlocklist);
    reloadTabsMatchingDomains(getDomainStrings(websiteBlocklist));
    console.log('Focus session started. Blocklist applied.');
  }

  if (message.type === 'UPDATE_BLOCKLIST') {
    console.log('UPDATE_BLOCKLIST at extn', message.payload);
    const websiteBlocklist = message.payload.filter(i => i.type === 'website');

    const oldDomains = new Set(getDomainStrings(currentBlocklist));
    const newDomains = new Set(getDomainStrings(websiteBlocklist));

    // Merge to find all affected domains
    const affectedDomains = [...new Set([...oldDomains, ...newDomains])];

    currentBlocklist = websiteBlocklist;
    applyBlockRules(currentBlocklist);
    reloadTabsMatchingDomains(affectedDomains);

    console.log('Blocklist updated mid-session.');
  }

  if (message.type === 'END_SESSION') {
    console.log('END_SESSION at extn', currentBlocklist);
    const domainsToReload = getDomainStrings(currentBlocklist);

    clearBlockRules();
    currentSessionId = null;
    currentBlocklist = [];

    reloadTabsMatchingDomains(domainsToReload);
    console.log('Focus session ended. Rules cleared.');
  }
});


/* ❷ Listen for rule matches (DNR feedback) */
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(
  async (info) => {
    console.log("currentSessionId",currentSessionId,"token",authToken,"info",info);
    // We only care about our dynamic rules (offset 10_000+)
    if (!currentSessionId) return;
    if (info.rule.ruleId < dynamicRuleOffset) return;

    console.log('Blocked visit detected → logging interruption');
    try {
    //  let res = await fetch(`http://localhost:8080/session/interrupt/${currentSessionId}`, {
     let res = await fetch(`https://focusflow-server.vercel.app/session/interrupt/${currentSessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      });
      let response= await res.json();
      console.log('res',response);
    } catch (err) {
      console.error('Failed to log interruption:', err);
    }
  }
);

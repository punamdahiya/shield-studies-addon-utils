/*
 *---
 * Filename: [index.js](https://github.com/mozilla/shield-studies-addon-utils/blob/refactor-to-classes/example/lib/index.js)`
 *
 *### Example Shield Study Addon
 * (using `shield-studies-addon-utils`)
 *
 */


/* preamble, imports */
"use strict";

const self = require("sdk/self");
const { when: unload } = require("sdk/system/unload");

/* 1: Shield Addons module needed for the STUDY */
const shield = require("shield-studies-addon-utils");

/**
 * 2: Configuration for the study. */
const studyConfig = require("./studyConfig");

/**
 * 3: Study Object.
 *
 * Instatiation sets or reuses existing addon-specific prefs:
 *
 * - `addonId.shield.firstrun`  - epoch
 * - `addonId.shield.variation` - which variation user has
 *
 */
const thisStudy = new shield.Study(studyConfig);

/**
 * 4: (Optional). Debug: watch for study and reporting
 */
shield.Reporter.on("report",(d)=>console.info("telemetry", d));
thisStudy.on("change",(newState)=>console.info("newState:", newState));


/**
 * 5: (Optional) Example Orientation and Ineligible UI
 *
 * - (optional) orientation example UI, with an 'extra' telemetry probe
 * - (optional) when ineligible UI
 *
 *   Note: panel won't work for `ineligible`, because addon will unload panel module.
 *
 */
function orientationMsg () {
  require("sdk/panel").Panel({
    width: 400, height: 400,
    contentURL: "data:text/html,Some orientation content"
  }).show()
  shield.report({action: "orientation-showed"})
}

function ineligibleMsg () {
  require("sdk/tabs").open("data:text/html,You are ineligible, sorry!  Next time?")
}

/* Listen to the correct study events.  There exist others */
thisStudy.once("installed", orientationMsg)
thisStudy.once("ineligible-die", ineligibleMsg)


/**
 * 6: Actually Startup the Study
 *
 * Cases for `self.loadReason`:
 *
 * * `install`
 *   - checks eligibility, won't install if `isElibible()` fails
 *   - otherwise `install` and run variation code
 * * `startup` | `upgrade`
 *   - run specific variation code
 *
 * Starts watcher for study-expiry after `config.duration` days.
 */

thisStudy.startup(self.loadReason);
/**
 * 7: Unload Study
 *
 * Cases:  `reason`
 *
 * * `disable` | `uninstall`
 *
 *   - calls `thisStudy.cleanup()`, knowing user-initiated | study expired
 */

unload((reason) => {
  thisStudy.shutdown(reason);
})

/**/
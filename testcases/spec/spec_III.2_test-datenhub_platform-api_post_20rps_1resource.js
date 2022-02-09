"use strict";

import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { check } from 'k6';
import exec from 'k6/execution';
import http from 'k6/http';
import { CONFIG } from '../../config/config.js';
import { HTTP_OPTIONS } from '../../config/httpConfig.js';
import {deleteAllRessources, getUrl} from '../../util/resources.js';

export let options = CONFIG.options;

let scenarios = {
  spec_III_2: {
    executor: "constant-arrival-rate",
    duration: "1m",
    preAllocatedVUs: 30,
    maxVUs: 100,
    rate: 20,
    timeUnit: "1s"
  }
};
options.scenarios = scenarios;

const URL = getUrl();
const CKAN_API_URL = URL + CONFIG.ckanAPIPath;
const PLATFORM_API_URL = URL + CONFIG.platformAPIPath;
const DATASET_NAME = CONFIG.datasetName;
const RESOURCE_NAME = CONFIG.resourceName;

export default function (data) {
  let url = `${PLATFORM_API_URL}/datasets/${DATASET_NAME}/resources/${RESOURCE_NAME}?primaryKey=id,timestamp`;
  var payload = JSON.stringify({
    id: exec.vu.idInInstance,
    timestamp: new Date().toISOString(),
    value: randomIntBetween(36, 37),
  });
  let res = http.post(url, payload, HTTP_OPTIONS);

  check(res, {
    'is status 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  if (res.status !== 200 && res.status !== 201) {
    console.log(`Response check failed: ${res.status_text}`);
  }
}

export function teardown(data) {
  deleteAllRessources(CKAN_API_URL, DATASET_NAME);
}
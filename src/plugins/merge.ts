// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {ManifestPlugin} from '../plugin';
import {
  CandidateReleasePullRequest,
  MANIFEST_PULL_REQUEST_TITLE_PATTERN,
  ROOT_PROJECT_PATH,
} from '../manifest';
import {PullRequestTitle} from '../util/pull-request-title';
import {PullRequestBody, ReleaseData} from '../util/pull-request-body';
import {BranchName} from '../util/branch-name';
import {Update} from '../update';
import {mergeUpdates} from '../updaters/composite';

/**
 * This plugin merges multiple pull requests into a single
 * release pull request.
 *
 * Release notes are broken up using `<summary>`/`<details>` blocks.
 */
export class Merge extends ManifestPlugin {
  async run(
    candidates: CandidateReleasePullRequest[]
  ): Promise<CandidateReleasePullRequest[]> {
    if (candidates.length < 1) {
      return candidates;
    }

    const releaseData: ReleaseData[] = [];
    const labels = new Set<string>();
    let rawUpdates: Update[] = [];
    for (const candidate of candidates) {
      const pullRequest = candidate.pullRequest;
      rawUpdates = rawUpdates.concat(...pullRequest.updates);
      for (const label of pullRequest.labels) {
        labels.add(label);
      }
      releaseData.push(...pullRequest.body.releaseData);
    }
    const updates = mergeUpdates(rawUpdates);

    const pullRequest = {
      title: PullRequestTitle.ofTargetBranch(
        this.targetBranch,
        MANIFEST_PULL_REQUEST_TITLE_PATTERN
      ),
      body: new PullRequestBody(releaseData),
      updates,
      labels: Array.from(labels),
      headRefName: BranchName.ofTargetBranch(this.targetBranch).toString(),
      draft: !candidates.some(candidate => !candidate.pullRequest.draft),
    };

    const releaseTypes = new Set(
      candidates.map(candidate => candidate.config.releaseType)
    );
    const releaseType =
      releaseTypes.size === 1 ? releaseTypes.values().next().value : 'simple';
    return [
      {
        path: ROOT_PROJECT_PATH,
        pullRequest,
        config: {
          releaseType,
        },
      },
    ];
  }
}

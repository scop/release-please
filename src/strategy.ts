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

import {ReleasePullRequest} from './release-pull-request';
import {Release} from './release';
import {PullRequest} from './pull-request';
import {Commit} from './commit';
import {VersioningStrategy} from './versioning-strategy';
import {ChangelogNotes} from './changelog-notes';

/**
 * A strategy is responsible for determining which files are
 * necessary to update in a release pull request.
 */
export interface Strategy {
  readonly changelogNotes: ChangelogNotes;
  readonly path: string;
  readonly versioningStrategy: VersioningStrategy;
  /**
   * Builds a candidate release pull request
   * @param {Commit[]} commits Raw commits to consider for this release.
   * @param {Release} latestRelease Optional. The last release for this
   *   component if available.
   * @param {boolean} draft Optional. Whether or not to create the pull
   *   request as a draft. Defaults to `false`.
   * @returns {ReleasePullRequest | undefined} The release pull request to
   *   open for this path/component. Returns undefined if we should not
   *   open a pull request.
   */
  buildReleasePullRequest(
    commits: Commit[],
    latestRelease?: Release,
    draft?: boolean,
    labels?: string[]
  ): Promise<ReleasePullRequest | undefined>;

  /**
   * Given a merged pull request, build the candidate release.
   * @param {PullRequest} mergedPullRequest The merged release pull request.
   * @returns {Release} The candidate release.
   */
  buildRelease(mergedPullRequest: PullRequest): Promise<Release | undefined>;

  /**
   * Return the component for this strategy. This may be a computed field.
   * @returns {string}
   */
  getComponent(): Promise<string | undefined>;
}

## Radar Contribution Guide

Thank you for your interest in contributing to Radar! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

### How to contribute
If you'd like to contribute, please fork the repo, fix, commit, and send a pull request against the `master` branch. Our team of maintainers will review and merge into the main code base. 

If you wish to submit more complex changes, please email us at `outreach@radar.tech` to ensure those changes are in-line with the general philosophy of the project. We can also give some early feedback to make the process easier.

We encourage a “PR early” approach. Please open a draft PR as early as possible and mark it as `WIP`. This will give our devs and other contributors an indication of what you're working on, so they don't pick up the same issue.

* Pull requests adding features or refactoring should be opened against the `master` branch.
* Be sure to write [good commit messages](https://chris.beams.io/posts/git-commit/) 

### Code quality

We strive for exceptional code quality. Please follow the existing code standards and conventions enforced by `tslint`.

If you're adding functionality, please also add tests and make sure they pass.
If you're adding a new public function/member, make sure you document it with JSDoc style comments.

### Styleguide

We use [TSLint](https://palantir.github.io/tslint/) with [custom configs](https://github.com/RadarTech/tslint-config) to keep our code style consistent.

To lint your code just run: `yarn lint`

### Branch structure & versioning

We use [semantic versioning](http://semver.org/), but before a package reaches v1.0.0 all breaking changes as well as new features will be minor version bumps.

We have two main branches: `master` and `prod`.

`master` represents the development state and is a default branch to which you will submit a PR.
`prod` represents the most recent released (published on npm) version.

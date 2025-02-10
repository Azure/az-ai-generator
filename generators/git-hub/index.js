"use strict";
import Generator from "yeoman-generator";
import chalk from "chalk";

export default class GitHubGenerator extends Generator {
  initializing () {
    try {
      this.spawnSync("git", ["--version"], { stdio : 'pipe' });
    } catch (error) {
      this.log(chalk.red(`Error: git is not installed. Please install git and try again.`));
      process.exit(1);
    }
    try {
      this.spawnSync("gh", ["--version"], { stdio : 'pipe' });
    } catch (error) {
      this.log(chalk.yellow(`⚠️  Warning: gh is not installed. If you plan on pushing to GitHub please install gh and try again.`));
    }
  }

  async prompting() {
    this.parent = this.options.parent;
    this.props = this.parent.props;
    const prompts = [
      {
        type: "confirm",
        name: "withGitHub",
        message: "Do you want to configure your solution for GitHub?",
        default: true,
        when: (answers) => !this.options.hasOwnProperty("withGitHub"),
      },
    ];

    return this.prompt(prompts).then(this._promptingGitHub.bind(this));
  }

  async _promptingGitHub(answers) {
    this.props.withGitHub = ((answers.withGitHub || this.props.withGitHub) + '').toLowerCase() === 'true'
    const prompts = this.props.withGitHub
      ? [
        {
          type: "string",
          name: "gitHubOrg",
          message: "What GitHub organization do you want to push to?",
          default: await this.github.username,
          when: (answers) => !this.options.hasOwnProperty("gitHubOrg"),
        },
        {
          type: "string",
          name: "gitHubRepo",
          message: "What is the GitHub repository you want to push to?",
          default: () => this.props.solutionSlug,
          when: (answers) => !this.options.hasOwnProperty("gitHubRepo"),
        },
        {
          type: "confirm",
          name: "withGitHubPush",
          message:
            "Create the remote GitHub repository and push with GitHub CLI?",
          default: false,
          when: (answers) => !this.options.hasOwnProperty("withGitHubPush"),
        }
      ]
      : [];
      return this.prompt(prompts).then(answers => {
        this.parent.props = { ...this.props, ...answers };
        this.parent.props.gitHubRepoUrl = `https://github.com/${this.parent.props.gitHubOrg}/${this.parent.props.gitHubRepo}`;
      });
  };


  default() {
    this.props = this.parent.props;
  }

  writing() {
    if (!this.props.withGitHub) {
      return;
    }
    this.log(`🔧 Configuring git and GitHub...`)

    this.fs.copy(
      this.templatePath("dot-gitignore"),
      this.destinationPath(".gitignore")
    );
  }

  end() {
    this.spawnSync("git", ["init", "-b", "main"]);
    if (this.spawnSync("git", ["status", "--porcelain"], {
      stdio: 'pipe'
    }).stdout.length > 0) {
      this.spawnSync("git", ["add", "."]);
      this.spawnSync("git", ["commit", "-m", "Initial commit"]);
      this.log(chalk.green("✅ Git repository initialized."));
    } else {
      this.log(chalk.yellow("⚠️ No changes to commit."));
    }

    if (this.props.withGitHub) {
      if ((this.props.withGitHubPush + '').toLowerCase() === 'true') {
        this.spawnSync("gh", [
          "repo",
          "create",
          `${this.props.gitHubOrg}/${this.props.gitHubRepo}`,
          "--private",
          "--source=.",
          "--remote=origin",
          "--push",
          "--description",
          `${this.props.solutionName} - ${this.props.solutionDescription}`,
          "--homepage", this.props.gitHubRepoUrl
        ]);
        this.log(chalk.green("✅ Successfully pushed to GitHub."));
      }
    }
  }
}

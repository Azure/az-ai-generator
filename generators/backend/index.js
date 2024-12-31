"use strict";
import Generator from "yeoman-generator";

export default class BackendGenerator extends Generator {
  async prompting() {
    this.parent = this.options.parent;
    this.props = this.parent.props;
    const prompts = [
      {
        type: "confirm",
        name: "withBackend",
        message: "Do you want to configure your solution with a backend?",
        default: true,
        when: (answers) => !this.options.hasOwnProperty("withBackend"),
      },
    ];

    return this.prompt(prompts).then(answers => {
      this.parent.props = { ...this.parent.props, ...answers };
      this.parent.props.withBackend = ((answers.withBackend || this.parent.props.withBackend) + '').toLowerCase() === 'true'
    });
  }

  default() {
    this.props = this.parent.props;
  }

  writing() {
    if (!this.props.withBackend) {
      return;
    }
    this.log(`🛠️ Creating backend...`);

    this.fs.copyTpl(
      this.templatePath("src/backend"),
      this.destinationPath("src/backend"),
      this.props
    );
  }
};

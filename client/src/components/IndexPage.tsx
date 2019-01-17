import * as React from "react";
import { inject, observer } from "mobx-react";
import AppState from "../lib/state";
import { RouteComponentProps } from "react-router-dom";

@inject("state")
@observer
class IndexPage extends React.Component<
  RouteComponentProps<{}> & { state: AppState },
  {}
> {
  public render() {
    return (
      <div>
        <h1>{this.props.state.site && this.props.state.site.siteTitle}</h1>
        <p>
          Powered by&nbsp;
          <a
            href={this.props.state.site && this.props.state.site.sourceCodeUrl}
          >
            Clover
          </a>
          , Licensed under AGPL v3+.
        </p>
      </div>
    );
  }
}
export default IndexPage;

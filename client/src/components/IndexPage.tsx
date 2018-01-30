import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps } from 'react-router-dom';
import Typography from 'material-ui/Typography/Typography';

@inject('state') @observer
class IndexPage extends React.Component<RouteComponentProps<{}> & { state: AppState }, {}> {
  render() {
    return (
      <div>
        <Typography type="headline" component="h1">
          {this.props.state.site && this.props.state.site.siteTitle}
        </Typography>
        <Typography component="p">
          Powered by&nbsp;
           <a href={this.props.state.site && this.props.state.site.sourceCodeUrl}>Clover</a>
          , Licensed under AGPL v3+.
        </Typography>
      </div>
    );
  }
}
export default IndexPage;
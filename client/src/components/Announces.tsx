import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import Card from 'material-ui/Card/Card';
import CardContent from 'material-ui/Card/CardContent';
import Typography from 'material-ui/Typography';
import LinearProgress from 'material-ui/Progress/LinearProgress';

@inject('state') @observer
class Announces extends React.Component<{ state: AppState, count?: number }, {}> {
  componentDidMount() {
    if (!this.props.state.announces) {
      this.props.state.loadAnnounces();
    }
  }
  render() {
    const { announces } = this.props.state;
    const { count } = this.props;
    return (
      <div>
        {announces ?
          announces.slice(0, count).map((value) => (
            <Card style={{ marginTop: '10px' }}>
              <CardContent>
                <Typography type="headline" component="h2">
                  {value.title}
                </Typography>
                <Typography dangerouslySetInnerHTML={{ __html: value.content }}>
                </Typography>
              </CardContent>
            </Card>
          )) :
          <LinearProgress />
        }
      </div>
    );
  }
}
export default Announces;
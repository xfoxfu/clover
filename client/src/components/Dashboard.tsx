import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps } from 'react-router-dom';
import { ChangeEvent } from 'react';

import Announces from './Announces';
import Card, { CardContent } from 'material-ui/Card';
import Stepper, { Step, StepLabel, StepContent } from 'material-ui/Stepper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Tabs, { Tab } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField/TextField';

import theme from '../lib/theme';

@inject('state') @observer
class Dashboard extends React.Component<RouteComponentProps<{}> & { state: AppState }, {
  currentStepShared: number;
  currentOsShared: number;
}> {
  state = {
    currentStepShared: 0,
    currentOsShared: 0,
  };

  handleChangeTab = (event: ChangeEvent<{}>, value: number) => {
    this.setState({
      currentStepShared: 0,
      currentOsShared: value
    });
  }
  handleNext = () => {
    this.setState({
      currentStepShared: this.state.currentStepShared + 1,
    });
  }
  handleBack = () => {
    this.setState({
      currentStepShared: this.state.currentStepShared - 1,
    });
  }
  handleReset = () => {
    this.setState({
      currentStepShared: 0,
    });
  }

  render() {
    const guide = this.props.state.guide;
    return (
      <span>
        {guide &&
          <Card style={{ marginTop: '10px' }}>
            <CardContent>
              <Typography type="headline" component="h2">
                VMess 配置说明（推荐）
            </Typography>
              <Typography>
                <Tabs
                  value={this.state.currentOsShared}
                  onChange={this.handleChangeTab}
                  indicatorColor="secondary"
                  textColor="secondary"
                  fullWidth
                  scrollable
                  scrollButtons="auto"
                >
                  {guide.vmess.map((value) =>
                    <Tab label={value.os} />
                  )}
                </Tabs>
              </Typography>
              <Stepper activeStep={this.state.currentStepShared} orientation="vertical">
                {guide.vmess[this.state.currentOsShared].descriptions.map((description, index) =>
                  <Step key={description.title}>
                    <StepLabel>{description.title}</StepLabel>
                    <StepContent>
                      <Typography>
                        <p>{description.content}</p>
                        {
                          description.links &&
                          <p>
                            {description.links.map((link) => (
                              <span style={{ paddingRight: '4px' }}>
                                <Button raised color="secondary" href={link.href} target="_blank">
                                  {link.name}
                                </Button>
                              </span>
                            ))}
                          </p>
                        }
                        {
                          description.fields &&
                          <p>
                            {description.fields.map((value) =>
                              <TextField
                                label={value.name}
                                value={value.data}
                                margin="normal"
                                fullWidth
                                disabled
                              />
                            )}
                          </p>
                        }
                        {
                          description.qrcode &&
                          <p>
                            <img src={description.qrcode} />
                          </p>
                        }
                        {
                          description.code &&
                          <TextField
                            label={description.code.name}
                            multiline
                            value={description.code.data}
                            margin="normal"
                            fullWidth
                            disabled
                          />
                        }
                      </Typography>
                      <Button
                        disabled={this.state.currentStepShared === 0}
                        onClick={this.handleBack}
                        style={{ margin: theme.spacing.unit }}
                      >
                        后退
                      </Button>
                      <Button
                        disabled={this.state.currentStepShared ===
                          guide.vmess[this.state.currentOsShared].descriptions.length}
                        raised
                        color="primary"
                        onClick={this.handleNext}
                        style={{ margin: theme.spacing.unit }}
                      >
                        {this.state.currentStepShared !==
                          guide.vmess[this.state.currentOsShared].descriptions.length - 1 ?
                          '前进' : '完成'}
                      </Button>
                    </StepContent>
                  </Step>
                )}
              </Stepper>
              {
                this.state.currentStepShared ===
                guide.vmess[this.state.currentOsShared].descriptions.length &&
                <Button
                  raised
                  color="primary"
                  onClick={this.handleReset}
                >
                  重置
                </Button>
              }
            </CardContent>
          </Card>}
        <Announces state={this.props.state} count={2} />
      </span>
    );
  }
}
export default Dashboard;
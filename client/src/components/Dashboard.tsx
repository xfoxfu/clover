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
import { GuideItem } from '../lib/guide';

@inject('state') @observer
class Dashboard extends React.Component<RouteComponentProps<{}> & { state: AppState }, {
  currentStep: number[];
  currentOs: number[];
}> {
  state = {
    currentStep: [0, 0],
    currentOs: [0, 0],
  };

  handleChangeTab = (index: number) => (event: ChangeEvent<{}>, value: number) => {
    this.setState((state) => ({
      currentStep: state.currentStep.map((v, i) => i === index ? 0 : v),
      currentOs: state.currentOs.map((v, i) => i === index ? value : v)
    }));
  }
  handleNext = (index: number) => () => {
    this.setState((state) => ({
      currentStep: state.currentStep.map((v, i) => i === index ? (v + 1) : v)
    }));
  }
  handleBack = (index: number) => () => {
    this.setState((state) => ({
      currentStep: state.currentStep.map((v, i) => i === index ? (v - 1) : v)
    }));
  }
  handleReset = (index: number) => () => {
    this.setState((state) => ({
      currentStep: state.currentStep.map((v, i) => i === index ? 0 : v),
    }));
  }

  render() {
    const guide = this.props.state.guide;
    const makeGuideUi = (title: string, guide: GuideItem[], index: number) => (
      <Card style={{ marginTop: '10px' }}>
        <CardContent>
          <Typography type="headline" component="h2">
            {title}
          </Typography>
          <Typography>
            <Tabs
              value={this.state.currentOs[index]}
              onChange={this.handleChangeTab(index)}
              indicatorColor="secondary"
              textColor="secondary"
              fullWidth
              scrollable
              scrollButtons="auto"
            >
              {guide.map((value) =>
                <Tab label={value.os} />
              )}
            </Tabs>
          </Typography>
          <Stepper activeStep={this.state.currentStep[index]} orientation="vertical">
            {guide[this.state.currentOs[index]].descriptions.map((description) =>
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
                            multiline
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
                  </Typography>
                  <Button
                    disabled={this.state.currentStep[index] === 0}
                    onClick={this.handleBack(index)}
                    style={{ margin: theme.spacing.unit }}
                  >
                    后退
                      </Button>
                  <Button
                    {...console.log(this.state, index, guide) }
                    disabled={this.state.currentStep[index] ===
                      guide[this.state.currentOs[index]].descriptions.length}
                    raised
                    color="primary"
                    onClick={this.handleNext(index)}
                    style={{ margin: theme.spacing.unit }}
                  >
                    {this.state.currentStep[index] !==
                      guide[this.state.currentOs[index]].descriptions.length - 1 ?
                      '前进' : '完成'}
                  </Button>
                </StepContent>
              </Step>
            )}
          </Stepper>
          {
            this.state.currentStep[index] ===
            guide[this.state.currentOs[index]].descriptions.length &&
            <Button
              raised
              color="primary"
              onClick={this.handleReset(index)}
            >
              重置
                </Button>
          }
        </CardContent>
      </Card>
    );
    return (
      <span>
        {guide &&
          <div>
            {[
              makeGuideUi("VMess 配置说明（推荐）", guide.vmess, 0),
              makeGuideUi("Shadowsocks 配置说明", guide.ss, 1),
            ]}
          </div>}
        <Announces state={this.props.state} count={2} />
      </span>
    );
  }
}
export default Dashboard;
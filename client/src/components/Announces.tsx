import * as React from "react";
import { inject, observer } from "mobx-react";
import AppState from "../lib/state";
import { Card } from "antd";

@inject("state")
@observer
class Announces extends React.Component<
  { state: AppState; count?: number },
  {}
> {
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
        {announces &&
          announces.slice(0, count).map(value => (
            <Card style={{ marginTop: "8px" }} title={value.title}>
              <div dangerouslySetInnerHTML={{ __html: value.content }} />
            </Card>
          ))}
      </div>
    );
  }
}

export default Announces;

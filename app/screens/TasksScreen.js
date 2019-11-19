import { Component } from 'react';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';

import withOrientation from 'providers/withOrientation';
import withTasks from 'providers/withTasks';
import withNetwork from 'providers/withNetwork';
import TaskListItem from 'components/TaskListItem';

export default withOrientation(withNetwork(withTasks(class extends Component {
  static displayName = 'TasksScreen';

  static propTypes = {
      componentId: propTypes.string,
      error: propTypes.string,
      tasksLoading: propTypes.bool,
      tasks: propTypes.array,
      isOffline: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
  }

  state = {
  };

  componentDidMount() {
      Navigation.events().bindComponent(this);

      if (!this.props.isOffline) {
          AppActions.getTasks();
      }
  }

onRefresh = () => {
    if (!this.props.isOffline) {
        AppActions.getTasks();
    }
}

renderList = ({ id, name, tasks }) => {
    const { props: { tasksLoading, componentId, isOffline, DeviceWidth, DeviceHeight } } = this;
    switch (id) {
        case 'ideas_for_review':
        case 'ideas_still_in_development': {
            let listEmptyComponent;
            switch (id) {
                case 'ideas_still_in_development':
                    listEmptyComponent = (
                        <FormGroup>
                            <H3 style={[Styles.textCenter]}>{localizedStrings.tasksIdeasStillInDevNotFound}</H3>
                        </FormGroup>
                    );
                    break;
                default:
                    listEmptyComponent = (
                        <FormGroup>
                            <H3 style={[Styles.textCenter]}>{localizedStrings.tasksNotFound}</H3>
                        </FormGroup>
                    );
            }
            const sections = _.map(_.groupBy(tasks, task => task.parent_entity.id), group => ({ title: group[0].parent_entity.name, data: group }));
            return (
                <SectionList
                  key={id}
                  tabLabel={name}
                  style={{ flex: 1 }}
                  sections={sections}
                  stickySectionHeadersEnabled={false}
                  renderSectionHeader={({ section: { title } }) => (
                      <FormGroup>
                          <Container>
                              <Flex>
                                  <H4>{title.toUpperCase()}</H4>
                              </Flex>
                          </Container>
                      </FormGroup>
                  )}
                  renderItem={({ item: task, index }) => (
                      <TaskListItem
                        key={index} task={task} group={id}
                        first={index === 0}
                        goToIdea={ideaId => Utils.goToIdea(componentId, isOffline, ideaId)}
                      />
                  )}
                  keyExtractor={item => item.entity.id}
                  refreshing={tasksLoading}
                  onRefresh={this.onRefresh}
                  ListEmptyComponent={listEmptyComponent}
                />
            );
        }
        default:
            return (
                <FlatList
                  key={id}
                  tabLabel={name}
                  style={{ flex: 1 }}
                  data={tasks}
                  renderItem={({ item: task, index }) => (
                      <TaskListItem
                        key={index} task={task} group={id}
                        first={index === 0}
                        goToIdea={ideaId => Utils.goToIdea(componentId, isOffline, ideaId)}
                      />
                  )}
                  keyExtractor={item => item.entity.id}
                  refreshing={tasksLoading}
                  onRefresh={this.onRefresh}
                  ListEmptyComponent={(
                      <FormGroup>
                          <H3 style={[Styles.textCenter]}>{localizedStrings.tasksNotFound}</H3>
                      </FormGroup>
                  )}
                />
            );
    }
}

render() {
    const { props: { tasks: groups, tasksLoading, componentId, isOffline } } = this;
    // const groupsWithTasks = _.filter(groups, group => group.tasks.length);
    // return (
    //     <Flex style={Styles.body}>
    //         <Container>
    //             <FormGroup>
    //                 <H1>Tasks</H1>
    //             </FormGroup>
    //         </Container>
    //         <ScrollableTabView
    //           tabBarTextStyle={Styles.tabBarText}
    //           tabBarActiveTextColor={pallette.wazokuBlue}
    //           tabBarUnderlineStyle={{ backgroundColor: pallette.wazokuBlue }}
    //           tabBarInactiveTextColor={pallette.greyMid}
    //           initialPage={0}
    //           renderTabBar={() => <ScrollableTabBar />}
    //         >
    //             {groupsWithTasks.length ? _.map(groupsWithTasks, this.renderList) : <Loader />}
    //         </ScrollableTabView>

    //     </Flex>
    // );
    const group = _.find(groups, g => g.id === 'ideas_still_in_development');
    if (!group) return null;
    return (
        <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
            <Container>
                <FormGroup>
                    <H1>{localizedStrings.tasks}</H1>
                </FormGroup>
                <H2>{group.name}</H2>
            </Container>
            {this.renderList(group)}
        </Flex>
    );
}
})));

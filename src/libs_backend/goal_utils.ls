$ = require 'jquery'

{
  memoizeSingleAsync
} = require 'libs_common/memoize'

{
  gexport
  gexport_module
} = require 'libs_common/gexport'

{cfy, yfy} = require 'cfy'

getAllInterventionsGoalInfo = cfy ->*
  goal_info = {
    name: 'debug/all_interventions'
    sitename: 'debug'
    description: 'This goal is satisfied by all interventions'
    measurement: 'always_zero_progress'
  }
  all_interventions = yield intervention_utils.list_all_interventions()
  goal_info.interventions = all_interventions
  return goal_info

export getGoalInfo = cfy (goal_name) ->*
  if goal_name == 'debug/all_interventions'
    return yield getAllInterventionsGoalInfo()
  goal_info_text = yield $.get "/goals/#{goal_name}/info.json"
  goal_info = JSON.parse goal_info_text
  goal_info.name = goal_name
  goal_info.sitename = goal_name.split('/')[0]
  return goal_info

export get_enabled_goals = cfy ->*
  enabled_goals_str = localStorage.getItem('enabled_goals')
  if not enabled_goals_str?
    enabled_goals = {}
  else
    enabled_goals = JSON.parse enabled_goals_str
  return enabled_goals

export set_enabled_goals = cfy (enabled_goals) ->*
  localStorage.setItem 'enabled_goals', JSON.stringify(enabled_goals)
  return

export set_goal_enabled = cfy (goal_name) ->*
  enabled_goals = yield get_enabled_goals()
  if enabled_goals[goal_name]?
    return
  enabled_goals[goal_name] = true
  yield set_enabled_goals enabled_goals

export set_goal_disabled = cfy (goal_name) ->*
  enabled_goals = yield get_enabled_goals()
  if not enabled_goals[goal_name]?
    return
  delete enabled_goals[goal_name]
  yield set_enabled_goals enabled_goals

export is_goal_enabled = cfy (goal_name) ->*
  enabled_goals = yield get_enabled_goals()
  return enabled_goals[goal_name]?

export list_all_goals = memoizeSingleAsync cfy ->*
  goals_list_text = yield $.get '/goals/goals.json'
  goals_list = JSON.parse goals_list_text
  return goals_list

get_site_to_goals = memoizeSingleAsync cfy ->*
  output = {}
  goals = yield get_goals()
  for goal_name,goal_info of goals
    sitename = goal_info.sitename
    if not output[sitename]?
      output[sitename] = []
    output[sitename].push goal_info
  return output

export list_goals_for_site = cfy (sitename) ->*
  # sitename example: facebook
  site_to_goals = yield get_site_to_goals()
  return site_to_goals[sitename]

export list_sites_for_which_goals_are_enabled = cfy ->*
  goals = yield get_goals()
  enabled_goals = yield get_enabled_goals()
  output = []
  output_set = {}
  for goal_name,goal_info of goals
    sitename = goal_info.sitename
    if enabled_goals[goal_name]? and not output_set[sitename]?
      output.push sitename
      output_set[sitename] = true
  return output

export get_goals = memoizeSingleAsync cfy ->*
  goals_list = yield list_all_goals()
  output = {}
  for goal_name in goals_list
    goal_info = yield getGoalInfo(goal_name)
    output[goal_name] = goal_info
  return output

export get_interventions_to_goals = memoizeSingleAsync cfy ->*
  output = {}
  goals = yield get_goals()
  for goal_name,goal_info of goals
    for intervention_name in goal_info.interventions
      if not output[intervention_name]?
        output[intervention_name] = []
      output[intervention_name].push goal_info
  return output

export get_goals_for_intervention = cfy (intervention_name) ->*
  interventions_to_goals = yield get_interventions_to_goals()
  goals_for_intervention = interventions_to_goals[intervention_name] ? []
  return goals_for_intervention

intervention_utils = require 'libs_backend/intervention_utils'

gexport_module 'goal_utils', -> eval(it)

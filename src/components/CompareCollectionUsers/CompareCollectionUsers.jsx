import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { observable, extendObservable } from 'mobx';
import { Link } from 'react-router-dom';
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText,
} from 'material-ui/Card';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Rectangle,
  ResponsiveContainer,
} from 'recharts';
import LoadingIndicator from '../LoadingIndicator';

import './style.css';

const CompareCollectionUsers = inject('CollectionStore', 'UserStore')(
  observer(({ CollectionStore, UserStore, userIds = [] }) => {
    const userLoggedIn = UserStore.isLoggedIn();
    const currentUserId = userLoggedIn && UserStore.userData.get('id');
    const viewData = observable.object(
      {
        isLoggedIn: userLoggedIn,
        users: observable.shallowArray([]),
        compareData: observable.map({}, { deep: false }),
      },
      {},
      { deep: false }
    );

    if (userIds.length == 0) console.warn('No users specified to compare');
    if (userLoggedIn) {
      userIds.map(id => {
        UserStore.getUserById(id).then(res => viewData.users.push(res));
        UserStore.compareUsers(currentUserId, id).then(res =>
          viewData.compareData.set(id, res)
        );
      });
    }

    return <CompareCollectionUsersView data={viewData} />;
  })
);

const CompareCollectionUsersView = observer(({ data }) => {
  if (!data.isLoggedIn) return <SignInToSeeView />;
  if (data.users.length == 0) return <LoadingIndicator />;
  return (
    <div>
      {data.users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          compareData={data.compareData.get(user.id)}
        />
      ))}
    </div>
  );
});

const UserCard = observer(({ user, compareData }) => {
  let name = user.first_name
    ? `${user.first_name} ${user.last_name}`
    : user.username;
  const location =
    (user.country_info
      ? user.country_info.name + (user.region_info ? ', ' : '')
      : '') + (user.region_info ? user.region_info.name : '');
  const link = `https://app.represent.me/profile/${user.id}/${user.username}`;

  //   return (<div className="user-card">
  //     <div className="photo"><a href={link} target="_blank"><img src={user.photo} /></a></div>
  //     <div className="name"><a href={link} target="_blank">{name}</a></div>
  //     <div className="age">{user.age} years old</div>
  //     <div className="location">{location}</div>
  //     {compareData ? (<div>
  //       <div className="match">{Math.floor(100-compareData.difference_percent)}% <span className="match-word">match</span></div>
  //
  //       <div className="match-barchart"><MatchBarchart compareData={compareData} /></div>
  //       </div>) : <LoadingIndicator />}
  //   </div>)
  // })

  if (compareData) {
    name = `${name} ${Math.floor(100 - compareData.difference_percent)}%`;
  }

  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardHeader
        title={name}
        subtitle={`${user.age}, ${location}`}
        avatar={user.photo.replace('localhost:8000', 'represent.me')}
      />
      <CardText style={{ paddingTop: 0 }}>
        {compareData ? (
          <div className="match-barchart">
            <MatchBarchart compareData={compareData} />
          </div>
        ) : (
          <LoadingIndicator />
        )}
      </CardText>
    </Card>
  );
});

const MatchBarchart = observer(({ compareData }) => {
  let totalCount = 0;
  compareData.difference_distances.map(diff => (totalCount += diff));
  const diffs = compareData.difference_distances;
  const values = {
    agree: (100 * (diffs[0] + diffs[1])) / totalCount,
    neutral: (100 * diffs[2]) / totalCount,
    disagree: (100 * (diffs[3] + diffs[4])) / totalCount,
  };
  return (
    <ResponsiveContainer height={25}>
      <BarChart layout="vertical" data={[values]}>
        <XAxis domain={[0, 100]} hide type="number" />
        <YAxis type="category" hide />
        <Bar dataKey="disagree" stackId="1" fill="#F43829" />
        <Bar dataKey="neutral" stackId="1" fill="#C6C7CA" />
        <Bar dataKey="agree" stackId="1" fill="#4AB246" />
      </BarChart>
    </ResponsiveContainer>
  );
});

const SignInToSeeView = () => (
  <div className="sign-in-to-see">
    Sign in to compare your answers to other users
  </div>
);

export default CompareCollectionUsers;

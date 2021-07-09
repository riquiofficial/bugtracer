# Bugtracer

## Aim

An app to log and track bugs for your projects while collaborating with your team. The app makes it easy to see how many bugs are present across your projects, where and communicate with team members.

## Technologies

The entire back end was built with Python, Django and Django Rest Framework. The front end uses a combination of HTML, CSS, Bootstrap, Bootstrap's SB-Admin-2 theme and Javascript.

## Usage

The app can be used on:

https://bug-tracer.herokuapp.com

### Teams

To use the app, you must create a team. This is done by default when the user registers. From here, you can start projects, and add bugs to those projects. You can also invite members to your team if you know their username. Teams are private and invite only, however, users can view your team names if they visit your profile.

To create a new team, you can click your profile picture in the nav bar, select "My Teams" and click "New Team". You will be prompted to enter your new team's name. As long as this does not conflict with someone elses team name, your new team will be created.

## Dependencies

- Python v3.8
- Django v2.2.5
- Django Rest Framework v3.12.2
- Django-environ 0.4.5
- Whitenoise 5.2

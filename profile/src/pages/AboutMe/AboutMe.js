import { User, Briefcase, LightBulb, AcademicCap } from '@styled-icons/heroicons-solid';
import { Wrapper, Section, Container, SubCard } from './styles.js';
import ReactAnimation from '../../common/ReactAnimation.js';
import RighHandSideCard from './RightHandSideCard.js';
import LeftHandSideCard from './LeftHandSideCard';


const AboutMe = () => {
    return (
        <>
            <Wrapper>
                <ReactAnimation />
            </Wrapper>
            <Section>
                <RighHandSideCard icon={<User />}>
                    Being curious by nature and of analytical attitude, I developed my interest
                    in Mathematics and Physics since early childhood and pursued
                    engineering post-graduation as part of my education. I believe I have the
                    trait to experiment in doing things in a different way and I find it very
                    enriching to create something which is productively beneficial. Coupled
                    with my mathematics and engineering background, writing software code
                    attracted me as it creates a tangible output and has numerous
                    application which impacts our day-to-day life.
                    <p><strong>Contact: </strong>shubha.learning@gmail.com</p>
                    <p><strong>Hobbies: </strong>Hiking , Gardening ,Travelling</p>
                </RighHandSideCard>
                <LeftHandSideCard icon={<Briefcase />}>
                    <Container><SubCard>Software Engineer - Frontend at Dubber
                        <div>May 2022 – Present Date</div>
                    </SubCard>
                        <SubCard>Front End Engineer at Megaport
                            <div>Jun 2020 - Apr 2022 (1 year 11 months)</div>
                        </SubCard>
                        <SubCard>Software Developer at Pinnacle IT
                            <div>Apr 2019 - Mar 2020 (1 year)</div>
                        </SubCard>
                        <SubCard >Full time internship at Dingo Mining
                            <div>Feb 2019 - Mar 2019 (1 month)</div>
                        </SubCard>
                    </Container>
                </LeftHandSideCard>
            </Section>
            <Section>
                <RighHandSideCard icon={<LightBulb />}>
                    React, Recoil, Tailwind, Kafka, Docker, KeyCloak, Ruby on Rails,
                    Honeybadger, Storybook, i18n, Slate.js, Google Analytics,
                    WebSocket, Segment-js, Lodash, Stripe, Jest & Cypress,
                    Redux, ReactJS, Express, CSS, HTML5, JavaScript,
                    Vue.js, Laravel, MySQL, Cypress, Jest, Storybook, Postman, ngrok,
                    Docker Software, Mockoon, Tailwind CSS, Jest, Bitbucket, GitHub,
                    Trello, Atlassian Jira, Agile Methodologies, Vuex, Lighthouse, Graphql
                    <p><strong>Others: </strong> Agile Methodology, GitHub, NodeJS, Next.JS, MongoDB, PostgreSQL</p>

                </RighHandSideCard>
                <LeftHandSideCard icon={<AcademicCap />}>
                    <Container><SubCard>Hackathon
                        <div>Runner-up at Dubber hackathon 2022 and innovation
                            challenge.</div>
                    </SubCard>
                        <SubCard>Meetups
                            <div>React Bris, BrisJS, Bris Ruby, Women-Who-Code, Muses
                                (NodeGirls), Enterprise UX Brisbane</div>
                        </SubCard>
                        <SubCard>Hackathon
                            <div>Brisbane Mobile App Hackathon 2018</div>
                        </SubCard>
                    </Container>
                </LeftHandSideCard>
            </Section>
        </>
    )
}
export default AboutMe
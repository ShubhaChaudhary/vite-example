import React from 'react';
import { Section, CardDiv, Right, Left, Wrapper } from './styles.js';
import Card from '../../Components/Cards'
import ReactAnimation from '../../common/ReactAnimation';


const LeftHandSideCard = ({ icon, children }) => {
    return (
        <Section>
            <Card>
                <CardDiv>
                    <Section style={{ padding: "1rem" }}>
                        <Right style={{color:"#a073cd"}}>{icon}</Right>
                        <Left>
                            {children}
                        </Left>
                    </Section>
                    <Wrapper>
                        <ReactAnimation />
                    </Wrapper>
                </CardDiv>
            </Card>
        </Section>
    );
}
    ;

export default LeftHandSideCard;